-- Run this in Supabase SQL Editor after phase-2-auth.sql.
-- Create a provider company row automatically whenever a Provider signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare user_role public.user_role;
begin
  user_role := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'trader');
  insert into public.profiles (id, full_name, role, phone, company_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), user_role, new.raw_user_meta_data ->> 'phone', new.raw_user_meta_data ->> 'company_name')
  on conflict (id) do nothing;
  if user_role = 'provider' then
    insert into public.providers (profile_id, company_name, status)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'company_name', 'New logistics provider'), 'pending')
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$$;

-- Atomically reserve capacity so two bookings cannot overfill a container.
create or replace function public.book_container(p_container_id uuid, p_box_count integer)
returns public.bookings
language plpgsql
security definer set search_path = public
as $$
declare reserved public.bookings;
declare selected public.containers;
begin
  if auth.uid() is null then raise exception 'You must sign in to book cargo space'; end if;
  if p_box_count < 1 then raise exception 'Choose at least one box'; end if;
  select * into selected from public.containers where id = p_container_id and status = 'active' for update;
  if not found then raise exception 'This container is no longer available'; end if;
  if selected.occupied_boxes + p_box_count > selected.total_boxes then raise exception 'Not enough capacity remains'; end if;
  insert into public.bookings (container_id, trader_id, box_count, amount, payment_status)
  values (selected.id, auth.uid(), p_box_count, selected.price_per_box * p_box_count, 'confirmed')
  returning * into reserved;
  update public.containers set occupied_boxes = occupied_boxes + p_box_count where id = selected.id;
  return reserved;
end;
$$;

grant execute on function public.book_container(uuid, integer) to authenticated;
