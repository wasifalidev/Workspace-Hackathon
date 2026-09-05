-- =====================================================================
-- 020_flat_universal_permissions.sql
-- Wasif's Workspace: Universal Permissions & Multi-Workspace Workflow
-- =====================================================================

-- 1. Helper function: Any member has full editing rights
create or replace function public.can_edit_workspace(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

-- 2. Helper function: Any member is treated as a workspace administrator
create or replace function public.is_workspace_admin(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

-- 3. Ensure any authenticated user can create workspaces and is auto-added as member
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

-- 4. Workspaces RLS: Any member can view and update; owner/member can manage
drop policy if exists "workspaces_select_members" on public.workspaces;
create policy "workspaces_select_members" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id));

drop policy if exists "workspaces_insert_authenticated" on public.workspaces;
create policy "workspaces_insert_authenticated" on public.workspaces
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "workspaces_update_admin" on public.workspaces;
create policy "workspaces_update_admin" on public.workspaces
  for update to authenticated using (public.is_workspace_member(id)) with check (public.is_workspace_member(id));

drop policy if exists "workspaces_delete_owner" on public.workspaces;
create policy "workspaces_delete_owner" on public.workspaces
  for delete to authenticated using (owner_id = auth.uid() or public.is_workspace_member(id));

-- 5. Workspace Members RLS: Any member can invite or manage members
drop policy if exists "workspace_members_select" on public.workspace_members;
create policy "workspace_members_select" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_members_insert_admin" on public.workspace_members;
create policy "workspace_members_insert_admin" on public.workspace_members
  for insert to authenticated with check (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_members_update_admin" on public.workspace_members;
create policy "workspace_members_update_admin" on public.workspace_members
  for update to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_members_delete" on public.workspace_members;
create policy "workspace_members_delete" on public.workspace_members
  for delete to authenticated using (public.is_workspace_member(workspace_id) or user_id = auth.uid());

-- 6. Projects RLS: Any workspace member can create, edit, and delete projects
drop policy if exists "projects_select_workspace_members" on public.projects;
create policy "projects_select_workspace_members" on public.projects
  for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "projects_insert_editors" on public.projects;
create policy "projects_insert_editors" on public.projects
  for insert to authenticated with check (public.is_workspace_member(workspace_id));

drop policy if exists "projects_update_editors" on public.projects;
create policy "projects_update_editors" on public.projects
  for update to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

drop policy if exists "projects_delete_admin" on public.projects;
create policy "projects_delete_admin" on public.projects
  for delete to authenticated using (public.is_workspace_member(workspace_id));

-- 7. Tasks RLS: Any workspace member can create, edit, complete, and delete tasks
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

-- 8. Subtasks, Comments, Labels RLS: Full access to all workspace members
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

drop policy if exists "comments_insert_members" on public.comments;
create policy "comments_insert_members" on public.comments
  for insert to authenticated with check (
    exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id where t.id = task_id and public.is_workspace_member(p.workspace_id))
  );
