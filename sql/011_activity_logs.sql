-- ============================================================
-- 011_activity_logs.sql
-- Audit trail for all significant application events
-- ============================================================

create type if not exists public.activity_action as enum (
  'task_created',
  'task_updated',
  'task_deleted',
  'task_status_changed',
  'task_priority_changed',
  'task_assignee_changed',
  'task_due_date_changed',
  'task_completed',
  'subtask_created',
  'subtask_completed',
  'comment_added',
  'comment_edited',
  'comment_deleted',
  'label_added',
  'label_removed',
  'attachment_uploaded',
  'attachment_deleted',
  'project_created',
  'project_updated',
  'project_archived',
  'workspace_created',
  'workspace_updated',
  'member_invited',
  'member_removed',
  'member_role_changed'
);

create table if not exists public.activity_logs (
  id              uuid primary key default uuid_generate_v4(),
  workspace_id    uuid references public.workspaces(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete cascade,
  task_id         uuid references public.tasks(id) on delete cascade,
  actor_id        uuid references public.profiles(id) on delete set null,
  action          public.activity_action not null,
  metadata        jsonb default '{}',   -- Action-specific data (old/new values, etc.)
  created_at      timestamptz not null default now()
);

create index if not exists activity_logs_workspace_id_idx on public.activity_logs(workspace_id, created_at desc);
create index if not exists activity_logs_project_id_idx on public.activity_logs(project_id, created_at desc);
create index if not exists activity_logs_task_id_idx on public.activity_logs(task_id, created_at desc);
create index if not exists activity_logs_actor_id_idx on public.activity_logs(actor_id);
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);

alter table public.activity_logs enable row level security;

comment on table public.activity_logs is 'Immutable audit log of all significant events in the application.';
comment on column public.activity_logs.metadata is 'JSON payload containing action-specific context: { old_status, new_status, ... }';
