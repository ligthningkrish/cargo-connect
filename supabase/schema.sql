-- CargoConnect core schema. Run in Supabase SQL Editor after creating a project.
create type public.user_role as enum ('trader', 'provider', 'admin');
create type public.provider_status as enum ('pending', 'approved', 'rejected');
create table public.profiles (id uuid primary key references auth.users on delete cascade, full_name text, role public.user_role not null default 'trader', phone text, company_name text, created_at timestamptz default now());
create table public.providers (id uuid primary key default gen_random_uuid(), profile_id uuid unique references public.profiles on delete cascade, status public.provider_status default 'pending', company_name text not null, created_at timestamptz default now());
create table public.containers (id uuid primary key default gen_random_uuid(), provider_id uuid references public.providers on delete cascade, origin text not null, destination text not null, departure_date date not null, total_boxes integer not null default 100, occupied_boxes integer not null default 0, price_per_box numeric not null, status text default 'active');
create table public.bookings (id uuid primary key default gen_random_uuid(), container_id uuid references public.containers, trader_id uuid references public.profiles, box_count integer not null check (box_count > 0), amount numeric not null, payment_status text default 'pending', created_at timestamptz default now());
create table public.messages (id uuid primary key default gen_random_uuid(), booking_id uuid references public.bookings on delete cascade, sender_id uuid references public.profiles, body text not null, created_at timestamptz default now());
alter table public.profiles enable row level security; alter table public.containers enable row level security; alter table public.bookings enable row level security; alter table public.messages enable row level security;
create policy "Public active containers" on public.containers for select using (status = 'active');
create policy "Users view own bookings" on public.bookings for select using (auth.uid() = trader_id);
create policy "Users create own bookings" on public.bookings for insert with check (auth.uid() = trader_id);
alter publication supabase_realtime add table public.messages;
