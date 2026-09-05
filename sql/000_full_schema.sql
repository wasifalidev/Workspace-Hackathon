-- =====================================================================
-- KINETIC WORKSPACE SAAS — COMPLETE ALL-IN-ONE DATABASE SETUP
-- Single-file execution for Supabase SQL Editor
-- Features: Full Schema, Security Definer Helpers, Triggers,
--           Robust Row-Level Security (RLS), Realtime & Storage
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------
-- 2. CUSTOM TYPES & ENUMS (IDEMPOTENT)
-- ---------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'workspace_role') then
    create type public.workspace_role as enum ('owner', 'admin', 'member', 'viewer');
  end if;

  if not exists (select 1 from pg_type where typname = 'project_role') then
    create type public.project_role as enum ('lead', 'member', 'viewer');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('urgent', 'high', 'medium', 'low', 'no_priority');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum (
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
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 3. CORE TABLES
-- ---------------------------------------------------------------------

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text,
  email               text unique not null,
  avatar_url          text,
  bio                 text,
  is_platform_admin   boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- User Preferences
create table if not exists public.user_preferences (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.profiles(id) on delete cascade,
  theme               text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  default_view        text not null default 'board' check (default_view in ('board', 'list', 'calendar')),
  email_notifications boolean not null default true,
  push_notifications  boolean not null default true,
  sound_enabled       boolean not null default false,
  compact_mode        boolean not null default false,
  updated_at          timestamptz not null default now()
);

-- Workspaces
create table if not exists public.workspaces (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  icon                text default '📁',
  color               text default '#c0c1ff',
  description         text,
  default_view        text not null default 'board' check (default_view in ('board', 'list', 'calendar')),
  owner_id            uuid not null references public.profiles(id) on delete restrict,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Workspace Members
create table if not exists public.workspace_members (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references public.workspaces(id) on delete cascade,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  role                public.workspace_role not null default 'member',
  invited_by          uuid references public.profiles(id) on delete set null,
  joined_at           timestamptz not null default now(),
  unique (workspace_id, user_id)
);

-- Projects
create table if not exists public.projects (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references public.workspaces(id) on delete cascade,
  name                text not null,
  description         text,
  icon                text default '⚡',
  color               text default '#c0c1ff',
  status              text not null default 'active' check (status in ('active', 'archived', 'completed')),
  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Project Members
create table if not exists public.project_members (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.projects(id) on delete cascade,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  role                public.project_role not null default 'member',
  joined_at           timestamptz not null default now(),
  unique (project_id, user_id)
);

-- Tasks
create table if not exists public.tasks (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references public.projects(id) on delete cascade,
  title               text not null,
  description         text,
  status              public.task_status not null default 'backlog',
  priority            public.task_priority not null default 'no_priority',
  assignee_id         uuid references public.profiles(id) on delete set null,
  due_date            date,
  start_date          date,
  estimate_points     integer,
  sort_order          float not null default 0,
  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Subtasks
create table if not exists public.subtasks (
  id                  uuid primary key default gen_random_uuid(),
  task_id             uuid not null references public.tasks(id) on delete cascade,
  title               text not null,
  is_completed        boolean not null default false,
  assignee_id         uuid references public.profiles(id) on delete set null,
  due_date            date,
  sort_order          float not null default 0,
  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Labels
create table if not exists public.labels (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references public.workspaces(id) on delete cascade,
  name                text not null,
  color               text not null default '#c0c1ff',
  description         text,
  created_at          timestamptz not null default now(),
  unique (workspace_id, name)
);

-- Task Labels (Junction)
create table if not exists public.task_labels (
  task_id             uuid not null references public.tasks(id) on delete cascade,
  label_id            uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- Comments
create table if not exists public.comments (
  id                  uuid primary key default gen_random_uuid(),
  task_id             uuid not null references public.tasks(id) on delete cascade,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  content             text not null,
  mentions            uuid[] default '{}',
  is_edited           boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Attachments
create table if not exists public.attachments (
  id                  uuid primary key default gen_random_uuid(),
  task_id             uuid not null references public.tasks(id) on delete cascade,
  uploaded_by         uuid references public.profiles(id) on delete set null,
  file_name           text not null,
  file_size           bigint not null,
  mime_type           text not null,
  storage_path        text not null,
  storage_bucket      text not null default 'attachments',
  created_at          timestamptz not null default now()
);

-- Activity Logs
create table if not exists public.activity_logs (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid references public.workspaces(id) on delete cascade,
  project_id          uuid references public.projects(id) on delete cascade,
  task_id             uuid references public.tasks(id) on delete cascade,
  actor_id            uuid references public.profiles(id) on delete set null,
  action              text not null,
  metadata            jsonb not null default '{}',
  created_at          timestamptz not null default now()
);

-- Notifications
create table if not exists public.notifications (
  id                  uuid primary key default gen_random_uuid(),
  recipient_id        uuid not null references public.profiles(id) on delete cascade,
  actor_id            uuid references public.profiles(id) on delete set null,
  type                public.notification_type not null,
  title               text not null,
  message             text,
  workspace_id        uuid references public.workspaces(id) on delete cascade,
  project_id          uuid references public.projects(id) on delete cascade,
  task_id             uuid references public.tasks(id) on delete cascade,
  is_read             boolean not null default false,
  read_at             timestamptz,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- ---------------------------------------------------------------------
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);
create index if not exists workspaces_slug_idx on public.workspaces(slug);
create index if not exists workspace_members_lookup_idx on public.workspace_members(workspace_id, user_id);
create index if not exists projects_workspace_idx on public.projects(workspace_id, status);
create index if not exists tasks_project_status_idx on public.tasks(project_id, status, sort_order);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists subtasks_task_id_idx on public.subtasks(task_id, sort_order);
create index if not exists comments_task_created_idx on public.comments(task_id, created_at);
create index if not exists activity_logs_workspace_idx on public.activity_logs(workspace_id, created_at desc);
create index if not exists notifications_user_unread_idx on public.notifications(recipient_id, is_read, created_at desc);

-- Full text search index on tasks
create index if not exists tasks_title_trgm_idx on public.tasks using gin (title gin_trgm_ops);

-- ---------------------------------------------------------------------
-- 5. HELPER FUNCTIONS (SECURITY DEFINER)
-- ---------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.get_workspace_role(p_workspace_id uuid)
returns public.workspace_role language sql security definer stable as $$
  select role from public.workspace_members
  where workspace_id = p_workspace_id
    and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_edit_workspace(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin', 'member')
  );
$$;

create or replace function public.is_workspace_admin(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_platform_admin()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select is_platform_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.get_workspace_stats(p_workspace_id uuid)
returns json language sql security definer stable as $$
  select json_build_object(
    'total_projects', (
      select count(*) from public.projects
      where workspace_id = p_workspace_id and status = 'active'
    ),
    'active_tasks', (
      select count(*) from public.tasks t
      join public.projects p on p.id = t.project_id
      where p.workspace_id = p_workspace_id
        and t.status not in ('done', 'cancelled')
    ),
    'completed_tasks', (
      select count(*) from public.tasks t
      join public.projects p on p.id = t.project_id
      where p.workspace_id = p_workspace_id
        and t.status = 'done'
    ),
    'overdue_tasks', (
      select count(*) from public.tasks t
      join public.projects p on p.id = t.project_id
      where p.workspace_id = p_workspace_id
        and t.due_date < current_date
        and t.status not in ('done', 'cancelled')
    )
  );
$$;

-- ---------------------------------------------------------------------
-- 6. AUTOMATION TRIGGERS
-- ---------------------------------------------------------------------

-- Updated_at triggers
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists workspaces_updated_at on public.workspaces;
create trigger workspaces_updated_at before update on public.workspaces
  for each row execute function public.handle_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.handle_updated_at();

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.handle_updated_at();

drop trigger if exists subtasks_updated_at on public.subtasks;
create trigger subtasks_updated_at before update on public.subtasks
  for each row execute function public.handle_updated_at();

drop trigger if exists comments_updated_at on public.comments;
create trigger comments_updated_at before update on public.comments
  for each row execute function public.handle_updated_at();

-- Auto-create profile & default personal workspace on new auth.users signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_name text;
  v_workspace_id uuid;
  v_slug text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'User');
  if v_name = '' or v_name is null then
    v_name := 'User';
  end if;

  -- 1. Create Profile
  begin
    insert into public.profiles (id, full_name, email, avatar_url)
    values (
      new.id,
      v_name,
      new.email,
      new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do update set
      full_name = excluded.full_name,
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  exception when others then
    raise warning 'Profile creation notice: %', sqlerrm;
  end;

  -- 2. Create Default Preferences
  begin
    insert into public.user_preferences (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  exception when others then
    null;
  end;

  -- 3. Auto-provision default Personal Workspace
  begin
    v_slug := lower(regexp_replace(v_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);
    if v_slug = '' or v_slug is null then
      v_slug := 'workspace';
    end if;
    v_slug := v_slug || '-' || substring(replace(new.id::text, '-', '') from 1 for 6);
    v_workspace_id := gen_random_uuid();

    insert into public.workspaces (id, name, slug, icon, color, owner_id)
    values (
      v_workspace_id,
      v_name || '''s Workspace',
      v_slug,
      '⚡',
      '#c0c1ff',
      new.id
    )
    on conflict do nothing;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (v_workspace_id, new.id, 'owner')
    on conflict do nothing;
  exception when others then
    raise warning 'Workspace creation notice: %', sqlerrm;
  end;

  return new;
exception when others then
  raise warning 'Outer signup error caught: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-add workspace creator as owner in workspace_members
create or replace function public.handle_workspace_created()
returns trigger language plpgsql security definer set search_path = public, extensions, pg_temp as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (workspace_id, user_id) do nothing;
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists on_workspace_created on public.workspaces;
create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_workspace_created();

-- Auto-audit logs on task events
create or replace function public.log_task_created()
returns trigger language plpgsql security definer as $$
declare
  v_workspace_id uuid;
begin
  select workspace_id into v_workspace_id
  from public.projects where id = new.project_id;

  insert into public.activity_logs (workspace_id, project_id, task_id, actor_id, action, metadata)
  values (
    v_workspace_id,
    new.project_id,
    new.id,
    new.created_by,
    'task_created',
    jsonb_build_object('title', new.title, 'status', new.status, 'priority', new.priority)
  );
  return new;
end;
$$;

drop trigger if exists on_task_created on public.tasks;
create trigger on_task_created
  after insert on public.tasks
  for each row execute function public.log_task_created();

create or replace function public.log_task_status_change()
returns trigger language plpgsql security definer as $$
declare
  v_workspace_id uuid;
begin
  if old.status <> new.status then
    select workspace_id into v_workspace_id
    from public.projects where id = new.project_id;

    insert into public.activity_logs (workspace_id, project_id, task_id, actor_id, action, metadata)
    values (
      v_workspace_id,
      new.project_id,
      new.id,
      auth.uid(),
      'task_status_changed',
      jsonb_build_object('old_status', old.status, 'new_status', new.status, 'title', new.title)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_task_updated on public.tasks;
create trigger on_task_updated
  after update on public.tasks
  for each row execute function public.log_task_status_change();

-- Auto-notification on task assignment
create or replace function public.notify_task_assigned()
returns trigger language plpgsql security definer as $$
declare
  v_actor_name text;
begin
  if new.assignee_id is not null and (old.assignee_id is null or old.assignee_id <> new.assignee_id) then
    if new.assignee_id <> auth.uid() then
      select full_name into v_actor_name from public.profiles where id = auth.uid();
      insert into public.notifications (recipient_id, actor_id, type, title, message, task_id)
      values (
        new.assignee_id,
        auth.uid(),
        'task_assigned',
        'Task assigned to you',
        coalesce(v_actor_name, 'Someone') || ' assigned you to: ' || new.title,
        new.id
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_task_assigned on public.tasks;
create trigger on_task_assigned
  after update on public.tasks
  for each row execute function public.notify_task_assigned();

-- ---------------------------------------------------------------------
-- 7. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.labels enable row level security;
alter table public.task_labels enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

-- ---------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES (DROP & RECREATE SAFELY)
-- ---------------------------------------------------------------------

-- PROFILES
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated using (public.is_platform_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());

-- USER PREFERENCES
drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own" on public.user_preferences
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own" on public.user_preferences
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own" on public.user_preferences
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- WORKSPACES
drop policy if exists "workspaces_select_members" on public.workspaces;
create policy "workspaces_select_members" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id));

drop policy if exists "workspaces_select_admin" on public.workspaces;
create policy "workspaces_select_admin" on public.workspaces
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "workspaces_insert_authenticated" on public.workspaces;
create policy "workspaces_insert_authenticated" on public.workspaces
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "workspaces_update_admin" on public.workspaces;
create policy "workspaces_update_admin" on public.workspaces
  for update to authenticated using (public.is_workspace_admin(id)) with check (public.is_workspace_admin(id));

drop policy if exists "workspaces_delete_owner" on public.workspaces;
create policy "workspaces_delete_owner" on public.workspaces
  for delete to authenticated using (owner_id = auth.uid());

-- WORKSPACE MEMBERS
drop policy if exists "workspace_members_select" on public.workspace_members;
create policy "workspace_members_select" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_members_insert_admin" on public.workspace_members;
create policy "workspace_members_insert_admin" on public.workspace_members
  for insert to authenticated with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace_members_update_admin" on public.workspace_members;
create policy "workspace_members_update_admin" on public.workspace_members
  for update to authenticated using (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace_members_delete" on public.workspace_members;
create policy "workspace_members_delete" on public.workspace_members
  for delete to authenticated using (public.is_workspace_admin(workspace_id) or user_id = auth.uid());

-- PROJECTS
drop policy if exists "projects_select_workspace_members" on public.projects;
create policy "projects_select_workspace_members" on public.projects
  for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "projects_insert_editors" on public.projects;
create policy "projects_insert_editors" on public.projects
  for insert to authenticated with check (public.can_edit_workspace(workspace_id));

drop policy if exists "projects_update_editors" on public.projects;
create policy "projects_update_editors" on public.projects
  for update to authenticated using (public.can_edit_workspace(workspace_id)) with check (public.can_edit_workspace(workspace_id));

drop policy if exists "projects_delete_admin" on public.projects;
create policy "projects_delete_admin" on public.projects
  for delete to authenticated using (public.is_workspace_admin(workspace_id));

-- PROJECT MEMBERS
drop policy if exists "project_members_select" on public.project_members;
create policy "project_members_select" on public.project_members
  for select to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "project_members_insert_admin" on public.project_members;
create policy "project_members_insert_admin" on public.project_members
  for insert to authenticated with check (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_admin(p.workspace_id))
  );

drop policy if exists "project_members_delete_admin" on public.project_members;
create policy "project_members_delete_admin" on public.project_members
  for delete to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and (public.is_workspace_admin(p.workspace_id) or user_id = auth.uid()))
  );

-- TASKS
drop policy if exists "tasks_select_workspace_members" on public.tasks;
create policy "tasks_select_workspace_members" on public.tasks
  for select to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "tasks_insert_editors" on public.tasks;
create policy "tasks_insert_editors" on public.tasks
  for insert to authenticated with check (
    exists (select 1 from public.projects p where p.id = project_id and public.can_edit_workspace(p.workspace_id))
  );

drop policy if exists "tasks_update_editors" on public.tasks;
create policy "tasks_update_editors" on public.tasks
  for update to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.can_edit_workspace(p.workspace_id))
  );

drop policy if exists "tasks_delete_editors" on public.tasks;
create policy "tasks_delete_editors" on public.tasks
  for delete to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.can_edit_workspace(p.workspace_id))
  );

-- SUBTASKS
drop policy if exists "subtasks_select" on public.subtasks;
create policy "subtasks_select" on public.subtasks
  for select to authenticated using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.is_workspace_member(p.workspace_id)
    )
  );

drop policy if exists "subtasks_insert_editors" on public.subtasks;
create policy "subtasks_insert_editors" on public.subtasks
  for insert to authenticated with check (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.can_edit_workspace(p.workspace_id)
    )
  );

drop policy if exists "subtasks_update_editors" on public.subtasks;
create policy "subtasks_update_editors" on public.subtasks
  for update to authenticated using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.can_edit_workspace(p.workspace_id)
    )
  );

drop policy if exists "subtasks_delete_editors" on public.subtasks;
create policy "subtasks_delete_editors" on public.subtasks
  for delete to authenticated using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.can_edit_workspace(p.workspace_id)
    )
  );

-- LABELS
drop policy if exists "labels_select" on public.labels;
create policy "labels_select" on public.labels
  for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "labels_insert_editors" on public.labels;
create policy "labels_insert_editors" on public.labels
  for insert to authenticated with check (public.can_edit_workspace(workspace_id));

drop policy if exists "labels_update_admin" on public.labels;
create policy "labels_update_admin" on public.labels
  for update to authenticated using (public.is_workspace_admin(workspace_id));

drop policy if exists "labels_delete_admin" on public.labels;
create policy "labels_delete_admin" on public.labels
  for delete to authenticated using (public.is_workspace_admin(workspace_id));

-- TASK LABELS
drop policy if exists "task_labels_select" on public.task_labels;
create policy "task_labels_select" on public.task_labels
  for select to authenticated using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.is_workspace_member(p.workspace_id)
    )
  );

drop policy if exists "task_labels_insert_editors" on public.task_labels;
create policy "task_labels_insert_editors" on public.task_labels
  for insert to authenticated with check (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.can_edit_workspace(p.workspace_id)
    )
  );

drop policy if exists "task_labels_delete_editors" on public.task_labels;
create policy "task_labels_delete_editors" on public.task_labels
  for delete to authenticated using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.can_edit_workspace(p.workspace_id)
    )
  );

-- COMMENTS
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments
  for select to authenticated using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.is_workspace_member(p.workspace_id)
    )
  );

drop policy if exists "comments_insert_editors" on public.comments;
create policy "comments_insert_editors" on public.comments
  for insert to authenticated with check (
    user_id = auth.uid() and exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.can_edit_workspace(p.workspace_id)
    )
  );

drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own" on public.comments
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete" on public.comments
  for delete to authenticated using (
    user_id = auth.uid() or exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.is_workspace_admin(p.workspace_id)
    )
  );

-- ATTACHMENTS
drop policy if exists "attachments_select" on public.attachments;
create policy "attachments_select" on public.attachments
  for select to authenticated using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.is_workspace_member(p.workspace_id)
    )
  );

drop policy if exists "attachments_insert_editors" on public.attachments;
create policy "attachments_insert_editors" on public.attachments
  for insert to authenticated with check (
    uploaded_by = auth.uid() and exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.can_edit_workspace(p.workspace_id)
    )
  );

drop policy if exists "attachments_delete" on public.attachments;
create policy "attachments_delete" on public.attachments
  for delete to authenticated using (
    uploaded_by = auth.uid() or exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id and public.is_workspace_admin(p.workspace_id)
    )
  );

-- ACTIVITY LOGS
drop policy if exists "activity_logs_select" on public.activity_logs;
create policy "activity_logs_select" on public.activity_logs
  for select to authenticated using (
    workspace_id is null or public.is_workspace_member(workspace_id)
  );

drop policy if exists "activity_logs_insert_service" on public.activity_logs;
create policy "activity_logs_insert_service" on public.activity_logs
  for insert to authenticated with check (actor_id = auth.uid());

-- NOTIFICATIONS
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (recipient_id = auth.uid());

drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications
  for insert to authenticated with check (true);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- ---------------------------------------------------------------------
-- 9. SUPABASE REALTIME CONFIGURATION
-- ---------------------------------------------------------------------
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.tasks, public.subtasks, public.comments, public.notifications, public.activity_logs;
  end if;
exception
  when duplicate_object then null;
  when others then null;
end $$;

-- ---------------------------------------------------------------------
-- 10. SUPABASE STORAGE BUCKET (ATTACHMENTS)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

drop policy if exists "Storage attachment read" on storage.objects;
create policy "Storage attachment read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'attachments');

drop policy if exists "Storage attachment write" on storage.objects;
create policy "Storage attachment write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'attachments');

-- =====================================================================
-- SETUP COMPLETE: Database is fully configured, secured, and indexed!
-- =====================================================================
