-- ============================================================
-- 007_tasks.sql
-- Tasks — the core work unit of the application
-- ============================================================

create type if not exists public.task_status as enum ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled');
create type if not exists public.task_priority as enum ('urgent', 'high', 'medium', 'low', 'no_priority');

create table if not exists public.tasks (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           text not null,
  description     text,           -- Rich text (markdown or plain)
  status          public.task_status not null default 'backlog',
  priority        public.task_priority not null default 'no_priority',
  assignee_id     uuid references public.profiles(id) on delete set null,
  due_date        date,
  start_date      date,
  estimate_points integer,        -- Story points
  sort_order      float not null default 0,  -- For ordering within a status column
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists tasks_assignee_id_idx on public.tasks(assignee_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_priority_idx on public.tasks(priority);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists tasks_created_by_idx on public.tasks(created_by);
create index if not exists tasks_sort_order_idx on public.tasks(project_id, status, sort_order);

-- Full text search index
create index if not exists tasks_title_trgm_idx on public.tasks using gin (title gin_trgm_ops);

alter table public.tasks enable row level security;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

comment on table public.tasks is 'Core task records. Each task belongs to a project and can have subtasks, comments, labels, and attachments.';
comment on column public.tasks.sort_order is 'Float used for manual ordering within a Kanban column. Uses lexorank-style float ordering.';
