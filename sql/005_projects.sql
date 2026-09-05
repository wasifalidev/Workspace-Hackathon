-- ============================================================
-- 005_projects.sql
-- Projects within workspaces
-- ============================================================

create type if not exists public.project_status as enum ('active', 'archived', 'completed');

create table if not exists public.projects (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  name          text not null,
  description   text,
  icon          text,            -- emoji or material symbol name
  color         text,            -- hex color
  status        public.project_status not null default 'active',
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists projects_workspace_id_idx on public.projects(workspace_id);
create index if not exists projects_created_by_idx on public.projects(created_by);
create index if not exists projects_status_idx on public.projects(status);

-- GIN index for text search
create index if not exists projects_name_trgm_idx on public.projects using gin (name gin_trgm_ops);

alter table public.projects enable row level security;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

comment on table public.projects is 'Projects belonging to a workspace. Each project has its own tasks and views.';
