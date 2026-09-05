-- ============================================================
-- 010_comments.sql
-- Task comments with mention support
-- ============================================================

create table if not exists public.comments (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  mentions    uuid[] default '{}',   -- Array of mentioned user IDs
  is_edited   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists comments_task_id_idx on public.comments(task_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists comments_created_at_idx on public.comments(task_id, created_at);

alter table public.comments enable row level security;

create trigger comments_updated_at
  before update on public.comments
  for each row execute function public.handle_updated_at();

comment on table public.comments is 'Task comments. Supports @mentions via the mentions UUID array.';
comment on column public.comments.mentions is 'Array of profile IDs mentioned in this comment, used to trigger notifications.';
