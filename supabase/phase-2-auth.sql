-- Run this once in Supabase SQL Editor after schema.sql.
-- It creates profile records at sign-up and applies user-safe access rules.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, phone, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'trader'),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'company_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.providers enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Providers manage own company" on public.providers;
create policy "Providers manage own company" on public.providers for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "Providers manage own containers" on public.containers;
create policy "Providers manage own containers" on public.containers for all using (exists (select 1 from public.providers p where p.id = provider_id and p.profile_id = auth.uid())) with check (exists (select 1 from public.providers p where p.id = provider_id and p.profile_id = auth.uid()));

drop policy if exists "Providers view related bookings" on public.bookings;
create policy "Providers view related bookings" on public.bookings for select using (exists (select 1 from public.containers c join public.providers p on p.id = c.provider_id where c.id = container_id and p.profile_id = auth.uid()));

drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages" on public.messages for select using (exists (select 1 from public.bookings b join public.containers c on c.id = b.container_id join public.providers p on p.id = c.provider_id where b.id = booking_id and (b.trader_id = auth.uid() or p.profile_id = auth.uid())));
drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages" on public.messages for insert with check (auth.uid() = sender_id and exists (select 1 from public.bookings b join public.containers c on c.id = b.container_id join public.providers p on p.id = c.provider_id where b.id = booking_id and (b.trader_id = auth.uid() or p.profile_id = auth.uid())));
