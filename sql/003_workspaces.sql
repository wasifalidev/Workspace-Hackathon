-- ============================================================
-- 003_workspaces.sql
-- Workspaces — top-level organizational container
-- ============================================================

create table if not exists public.workspaces (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  icon          text,            -- emoji or icon identifier
  color         text,            -- hex color for workspace avatar
  description   text,
  default_view  text not null default 'board' check (default_view in ('board', 'list', 'calendar')),
  owner_id      uuid not null references public.profiles(id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);
create index if not exists workspaces_slug_idx on public.workspaces(slug);

alter table public.workspaces enable row level security;

create trigger workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.handle_updated_at();

comment on table public.workspaces is 'Top-level organizational containers. Each workspace has its own projects and members.';
