-- ============================================================
-- 008_subtasks.sql
-- Subtasks (parent-child task relationships)
-- ============================================================

create table if not exists public.subtasks (
  id              uuid primary key default uuid_generate_v4(),
  task_id         uuid not null references public.tasks(id) on delete cascade,
  title           text not null,
  is_completed    boolean not null default false,
  assignee_id     uuid references public.profiles(id) on delete set null,
  due_date        date,
  sort_order      float not null default 0,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists subtasks_task_id_idx on public.subtasks(task_id);
create index if not exists subtasks_sort_order_idx on public.subtasks(task_id, sort_order);

alter table public.subtasks enable row level security;

create trigger subtasks_updated_at
  before update on public.subtasks
  for each row execute function public.handle_updated_at();

comment on table public.subtasks is 'Subtasks belonging to a parent task. Each subtask has a completion state and optional assignee.';
