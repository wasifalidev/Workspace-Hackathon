-- ============================================================
-- 004_workspace_members.sql
-- Workspace membership and roles
-- ============================================================

create type if not exists public.workspace_role as enum ('owner', 'admin', 'member', 'viewer');

create table if not exists public.workspace_members (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          public.workspace_role not null default 'member',
  invited_by    uuid references public.profiles(id) on delete set null,
  joined_at     timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index if not exists workspace_members_workspace_id_idx on public.workspace_members(workspace_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);

alter table public.workspace_members enable row level security;

comment on table public.workspace_members is 'Membership records linking profiles to workspaces with role-based access.';
comment on column public.workspace_members.role is 'owner: full control | admin: manage settings/members | member: collaborate | viewer: read-only';
