-- ============================================================
-- 013_user_preferences.sql
-- Per-user application preferences
-- ============================================================

create table if not exists public.user_preferences (
  user_id                   uuid primary key references public.profiles(id) on delete cascade,
  theme                     text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  default_view              text not null default 'board' check (default_view in ('board', 'list', 'calendar')),
  sidebar_collapsed         boolean not null default false,
  notify_task_assigned      boolean not null default true,
  notify_task_mentioned     boolean not null default true,
  notify_task_due_soon      boolean not null default true,
  notify_comment_added      boolean not null default true,
  notify_workspace_invite   boolean not null default true,
  email_digest              text not null default 'daily' check (email_digest in ('never', 'daily', 'weekly')),
  updated_at                timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.handle_updated_at();

comment on table public.user_preferences is 'Per-user application preferences including theme, default views, and notification settings.';
