-- =====================================================================
-- 021_full_crud_universal_permissions.sql
-- Wasif's Workspace: Full CRUD Universal Permissions & RLS Configuration
-- 
-- Run this single smart script once in your Supabase SQL Editor.
-- It ensures all authenticated users have full CRUD (CREATE, READ, 
-- UPDATE, DELETE) on Workspaces, Projects, Tasks, Subtasks, Comments,
-- and Profiles without restrictive role blocks.
-- =====================================================================

-- 1. Helper function: Check if user is a member of workspace
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

-- 2. Helper function: Universal editing privileges for members
create or replace function public.can_edit_workspace(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

-- 3. Auto-add workspace creator as owner in workspace_members
create or replace function public.handle_workspace_created()
returns trigger language plpgsql security definer as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (workspace_id, user_id) do update
  set role = 'owner';
  return new;
end;
$$;

drop trigger if exists on_workspace_created on public.workspaces;
create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_workspace_created();

-- 4. Enable RLS on core tables
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.comments enable row level security;
alter table public.profiles enable row level security;

-- =====================================================================
-- WORKSPACES POLICIES (Full CRUD)
-- =====================================================================
drop policy if exists "workspaces_select_members" on public.workspaces;
create policy "workspaces_select_members" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id) or owner_id = auth.uid());

drop policy if exists "workspaces_insert_authenticated" on public.workspaces;
create policy "workspaces_insert_authenticated" on public.workspaces
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "workspaces_update_admin" on public.workspaces;
create policy "workspaces_update_admin" on public.workspaces
  for update to authenticated using (public.is_workspace_member(id) or owner_id = auth.uid())
  with check (public.is_workspace_member(id) or owner_id = auth.uid());

drop policy if exists "workspaces_delete_owner" on public.workspaces;
create policy "workspaces_delete_owner" on public.workspaces
  for delete to authenticated using (owner_id = auth.uid() or public.is_workspace_member(id));

-- =====================================================================
-- WORKSPACE MEMBERS POLICIES (Full CRUD)
-- =====================================================================
drop policy if exists "workspace_members_select" on public.workspace_members;
create policy "workspace_members_select" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id) or user_id = auth.uid());

drop policy if exists "workspace_members_insert_admin" on public.workspace_members;
create policy "workspace_members_insert_admin" on public.workspace_members
  for insert to authenticated with check (public.is_workspace_member(workspace_id) or user_id = auth.uid());

drop policy if exists "workspace_members_update_admin" on public.workspace_members;
create policy "workspace_members_update_admin" on public.workspace_members
  for update to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_members_delete" on public.workspace_members;
create policy "workspace_members_delete" on public.workspace_members
  for delete to authenticated using (public.is_workspace_member(workspace_id) or user_id = auth.uid());

-- =====================================================================
-- PROJECTS POLICIES (Full CRUD: Select, Insert, Update, Delete)
-- =====================================================================
drop policy if exists "projects_select_workspace_members" on public.projects;
create policy "projects_select_workspace_members" on public.projects
  for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "projects_insert_editors" on public.projects;
create policy "projects_insert_editors" on public.projects
  for insert to authenticated with check (public.is_workspace_member(workspace_id));

drop policy if exists "projects_update_editors" on public.projects;
create policy "projects_update_editors" on public.projects
  for update to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "projects_delete_admin" on public.projects;
create policy "projects_delete_admin" on public.projects
  for delete to authenticated using (public.is_workspace_member(workspace_id));

-- =====================================================================
-- TASKS POLICIES (Full CRUD: Select, Insert, Update, Delete)
-- =====================================================================
drop policy if exists "tasks_select_workspace_members" on public.tasks;
create policy "tasks_select_workspace_members" on public.tasks
  for select to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "tasks_insert_editors" on public.tasks;
create policy "tasks_insert_editors" on public.tasks
  for insert to authenticated with check (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "tasks_update_editors" on public.tasks;
create policy "tasks_update_editors" on public.tasks
  for update to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "tasks_delete_editors" on public.tasks;
create policy "tasks_delete_editors" on public.tasks
  for delete to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  );

-- =====================================================================
-- SUBTASKS POLICIES (Full CRUD)
-- =====================================================================
drop policy if exists "subtasks_select_members" on public.subtasks;
create policy "subtasks_select_members" on public.subtasks
  for select to authenticated using (
    exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "subtasks_insert_editors" on public.subtasks;
create policy "subtasks_insert_editors" on public.subtasks
  for insert to authenticated with check (
    exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "subtasks_update_editors" on public.subtasks;
create policy "subtasks_update_editors" on public.subtasks
  for update to authenticated using (
    exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "subtasks_delete_editors" on public.subtasks;
create policy "subtasks_delete_editors" on public.subtasks
  for delete to authenticated using (
    exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_id and public.is_workspace_member(p.workspace_id))
  );

-- =====================================================================
-- COMMENTS POLICIES (Full CRUD)
-- =====================================================================
drop policy if exists "comments_select_members" on public.comments;
create policy "comments_select_members" on public.comments
  for select to authenticated using (
    exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "comments_insert_members" on public.comments;
create policy "comments_insert_members" on public.comments
  for insert to authenticated with check (
    exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_id and public.is_workspace_member(p.workspace_id))
  );

drop policy if exists "comments_update_owner" on public.comments;
create policy "comments_update_owner" on public.comments
  for update to authenticated using (user_id = auth.uid());

drop policy if exists "comments_delete_members" on public.comments;
create policy "comments_delete_members" on public.comments
  for delete to authenticated using (
    user_id = auth.uid() or exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_id and public.is_workspace_member(p.workspace_id))
  );

-- =====================================================================
-- PROFILES POLICIES
-- =====================================================================
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update to authenticated using (id = auth.uid());
