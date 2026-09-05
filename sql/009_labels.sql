-- ============================================================
-- 009_labels.sql
-- Labels and task-label junction table
-- ============================================================

create table if not exists public.labels (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  name          text not null,
  color         text not null default '#6366F1',  -- hex color
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (workspace_id, name)
);

create index if not exists labels_workspace_id_idx on public.labels(workspace_id);

alter table public.labels enable row level security;

-- Junction table: tasks <-> labels (many-to-many)
create table if not exists public.task_labels (
  task_id   uuid not null references public.tasks(id) on delete cascade,
  label_id  uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

create index if not exists task_labels_task_id_idx on public.task_labels(task_id);
create index if not exists task_labels_label_id_idx on public.task_labels(label_id);

alter table public.task_labels enable row level security;

comment on table public.labels is 'Workspace-scoped labels for categorizing tasks.';
comment on table public.task_labels is 'Many-to-many junction between tasks and labels.';
