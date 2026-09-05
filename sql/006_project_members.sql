-- ============================================================
-- 006_project_members.sql
-- Project-level member assignments (subset of workspace members)
-- ============================================================

create table if not exists public.project_members (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          public.workspace_role not null default 'member',
  added_by      uuid references public.profiles(id) on delete set null,
  added_at      timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists project_members_project_id_idx on public.project_members(project_id);
create index if not exists project_members_user_id_idx on public.project_members(user_id);

alter table public.project_members enable row level security;

comment on table public.project_members is 'Project-level membership. Users must already be workspace members to be project members.';
