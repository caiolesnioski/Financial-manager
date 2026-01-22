-- Supabase schema for Gerenciador de Finanças
-- Run this in Supabase SQL Editor

-- Enable extension for UUID generation (Supabase uses pgcrypto)
create extension if not exists "pgcrypto";

-- ACCOUNTS
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  type text not null check (type in ('bank','wallet')),
  initial_balance numeric default 0,
  current_balance numeric default 0,
  inserted_at timestamptz default now()
);

alter table public.accounts enable row level security;

create policy "accounts_owner_select" on public.accounts
  for select using (user_id = auth.uid());
create policy "accounts_owner_insert" on public.accounts
  for insert with check (user_id = auth.uid());
create policy "accounts_owner_update" on public.accounts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "accounts_owner_delete" on public.accounts
  for delete using (user_id = auth.uid());

create index if not exists accounts_user_id_idx on public.accounts (user_id);

-- ENTRIES (lancamentos)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('expense','income','transfer')),
  description text,
  category text,
  account uuid,
  origin_account uuid,
  destination_account uuid,
  value numeric not null default 0,
  date timestamptz not null,
  repeat boolean default false,
  inserted_at timestamptz default now()
);

alter table public.entries enable row level security;

create policy "entries_owner_select" on public.entries
  for select using (user_id = auth.uid());
create policy "entries_owner_insert" on public.entries
  for insert with check (user_id = auth.uid());
create policy "entries_owner_update" on public.entries
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "entries_owner_delete" on public.entries
  for delete using (user_id = auth.uid());

create index if not exists entries_user_id_idx on public.entries (user_id);
create index if not exists entries_date_idx on public.entries (date);

-- LIMITS
create table if not exists public.limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category text not null,
  limit_value numeric not null default 0,
  used_value numeric default 0,
  percentage integer default 0,
  inserted_at timestamptz default now()
);

alter table public.limits enable row level security;

create policy "limits_owner_select" on public.limits
  for select using (user_id = auth.uid());
create policy "limits_owner_insert" on public.limits
  for insert with check (user_id = auth.uid());
create policy "limits_owner_update" on public.limits
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "limits_owner_delete" on public.limits
  for delete using (user_id = auth.uid());

create index if not exists limits_user_id_idx on public.limits (user_id);

-- Notes:
-- 1) Supabase auth stores users in the 'auth.users' table. We store user_id (UUID) in each table and policies
--    ensure that only the owner (auth.uid()) can access or modify their rows.
-- 2) When inserting from the client, include the 'user_id' field set to the current auth user id.
--    Example client flow (JS):
--      const { data: { user } } = await supabase.auth.getUser();
--      await supabase.from('accounts').insert([{ user_id: user.id, name: 'Conta X', type: 'bank' }])

-- 3) If you want server-enforced user_id on insert without trusting the client, implement a Postgres trigger
--    or use Supabase Edge Functions to perform inserts server-side.

