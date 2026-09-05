-- ============================================================
-- 002_profiles.sql
-- User profiles linked to Supabase Auth users
-- ============================================================

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text unique not null,
  avatar_url    text,
  bio           text,
  is_platform_admin boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index for email lookups
create index if not exists profiles_email_idx on public.profiles(email);

-- Enable RLS
alter table public.profiles enable row level security;

-- Updated_at trigger function (shared across tables)
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Comment
comment on table public.profiles is 'Application user profiles linked to auth.users';
comment on column public.profiles.is_platform_admin is 'Platform-level admin flag. Set via SQL only, never from client code.';
