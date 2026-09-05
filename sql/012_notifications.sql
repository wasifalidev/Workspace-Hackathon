-- ============================================================
-- 012_notifications.sql
-- In-app notification system
-- ============================================================

create type if not exists public.notification_type as enum (
  'task_assigned',
  'task_mentioned',
  'task_due_soon',
  'task_overdue',
  'comment_added',
  'comment_mentioned',
  'project_invitation',
  'workspace_invitation',
  'member_joined',
  'task_status_changed'
);

create table if not exists public.notifications (
  id              uuid primary key default uuid_generate_v4(),
  recipient_id    uuid not null references public.profiles(id) on delete cascade,
  actor_id        uuid references public.profiles(id) on delete set null,
  type            public.notification_type not null,
  title           text not null,
  message         text,
  workspace_id    uuid references public.workspaces(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete cascade,
  task_id         uuid references public.tasks(id) on delete cascade,
  is_read         boolean not null default false,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists notifications_recipient_id_idx on public.notifications(recipient_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(recipient_id, is_read) where is_read = false;

alter table public.notifications enable row level security;

comment on table public.notifications is 'In-app notifications delivered to specific users.';
