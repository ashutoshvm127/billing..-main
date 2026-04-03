-- Core tables for billing app persistence
-- Run in Supabase SQL editor

create table if not exists public.user_permissions (
  id text primary key,
  email text not null unique,
  password text not null,
  role text not null check (role in ('admin', 'user')),
  access_level text not null check (access_level in ('full', 'limited', 'readonly')),
  company_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id text primary key,
  user_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists invoices_user_id_idx on public.invoices (user_id);

create table if not exists public.payments (
  id text primary key,
  user_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments (user_id);

create table if not exists public.quotes (
  id text primary key,
  user_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists quotes_user_id_idx on public.quotes (user_id);

create table if not exists public.reports (
  id text primary key,
  user_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists reports_user_id_idx on public.reports (user_id);

-- Optional for simple client-side access without strict RLS.
-- For production, enable RLS and add proper policies.
alter table public.user_permissions disable row level security;
alter table public.invoices disable row level security;
alter table public.payments disable row level security;
alter table public.quotes disable row level security;
alter table public.reports disable row level security;
