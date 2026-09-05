-- ============================================================
-- 014_attachments.sql
-- File attachments linked to tasks (files stored in Supabase Storage)
-- ============================================================

create table if not exists public.attachments (
  id              uuid primary key default uuid_generate_v4(),
  task_id         uuid not null references public.tasks(id) on delete cascade,
  uploaded_by     uuid references public.profiles(id) on delete set null,
  file_name       text not null,
  file_size       bigint not null,           -- Size in bytes
  mime_type       text not null,
  storage_path    text not null,             -- Path within Supabase Storage bucket
  storage_bucket  text not null default 'attachments',
  created_at      timestamptz not null default now()
);

create index if not exists attachments_task_id_idx on public.attachments(task_id);
create index if not exists attachments_uploaded_by_idx on public.attachments(uploaded_by);

alter table public.attachments enable row level security;

comment on table public.attachments is 'Metadata for files uploaded to Supabase Storage and attached to tasks.';
comment on column public.attachments.storage_path is 'Full path within the Supabase Storage bucket, e.g. workspace_id/project_id/task_id/filename.ext';
