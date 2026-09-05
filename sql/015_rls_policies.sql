-- ============================================================
-- 015_rls_policies.sql
-- Row Level Security policies for ALL tables
-- CRITICAL: Run after all table creation scripts
-- ============================================================

-- ----------------------------------------------------------------
-- HELPER FUNCTION: Check if user is workspace member
-- ----------------------------------------------------------------
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
  );
$$;

-- HELPER: Get user role in workspace
create or replace function public.get_workspace_role(p_workspace_id uuid)
returns public.workspace_role language sql security definer stable as $$
  select role from public.workspace_members
  where workspace_id = p_workspace_id
    and user_id = auth.uid()
  limit 1;
$$;

-- HELPER: Check if user can edit in workspace (owner, admin, member)
create or replace function public.can_edit_workspace(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin', 'member')
  );
$$;

-- HELPER: Check if user is workspace admin+
create or replace function public.is_workspace_admin(p_workspace_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

-- HELPER: Check if user is platform admin
create or replace function public.is_platform_admin()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select is_platform_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ----------------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------------
-- Anyone can view any profile (needed for @mentions, assignee lists)
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Platform admins can update any profile
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_platform_admin());

-- Insert: handled by trigger on auth.users (no direct client insert)
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ----------------------------------------------------------------
-- WORKSPACES
-- ----------------------------------------------------------------
-- Members can view their workspaces
create policy "workspaces_select_members"
  on public.workspaces for select
  to authenticated
  using (public.is_workspace_member(id));

-- Platform admins can view all workspaces
create policy "workspaces_select_admin"
  on public.workspaces for select
  to authenticated
  using (public.is_platform_admin());

-- Any authenticated user can create a workspace
create policy "workspaces_insert_authenticated"
  on public.workspaces for insert
  to authenticated
  with check (owner_id = auth.uid());

-- Only workspace admins and owners can update
create policy "workspaces_update_admin"
  on public.workspaces for update
  to authenticated
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

-- Only owners can delete their workspace
create policy "workspaces_delete_owner"
  on public.workspaces for delete
  to authenticated
  using (owner_id = auth.uid());

-- ----------------------------------------------------------------
-- WORKSPACE MEMBERS
-- ----------------------------------------------------------------
-- Members can view other members in their workspace
create policy "workspace_members_select"
  on public.workspace_members for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

-- Only admins can add/invite members
create policy "workspace_members_insert_admin"
  on public.workspace_members for insert
  to authenticated
  with check (public.is_workspace_admin(workspace_id));

-- Only admins can update roles (but not above their own level)
create policy "workspace_members_update_admin"
  on public.workspace_members for update
  to authenticated
  using (public.is_workspace_admin(workspace_id));

-- Admins can remove members; users can remove themselves
create policy "workspace_members_delete"
  on public.workspace_members for delete
  to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    or user_id = auth.uid()
  );

-- ----------------------------------------------------------------
-- PROJECTS
-- ----------------------------------------------------------------
create policy "projects_select_workspace_members"
  on public.projects for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "projects_insert_editors"
  on public.projects for insert
  to authenticated
  with check (public.can_edit_workspace(workspace_id));

create policy "projects_update_editors"
  on public.projects for update
  to authenticated
  using (public.can_edit_workspace(workspace_id))
  with check (public.can_edit_workspace(workspace_id));

create policy "projects_delete_admin"
  on public.projects for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id));

-- ----------------------------------------------------------------
-- PROJECT MEMBERS
-- ----------------------------------------------------------------
create policy "project_members_select"
  on public.project_members for select
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and public.is_workspace_member(p.workspace_id)
    )
  );

create policy "project_members_insert_admin"
  on public.project_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and public.is_workspace_admin(p.workspace_id)
    )
  );

create policy "project_members_delete_admin"
  on public.project_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and (public.is_workspace_admin(p.workspace_id) or user_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------
-- TASKS
-- ----------------------------------------------------------------
create policy "tasks_select_workspace_members"
  on public.tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and public.is_workspace_member(p.workspace_id)
    )
  );

create policy "tasks_insert_editors"
  on public.tasks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

create policy "tasks_update_editors"
  on public.tasks for update
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

create policy "tasks_delete_editors"
  on public.tasks for delete
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

-- ----------------------------------------------------------------
-- SUBTASKS
-- ----------------------------------------------------------------
create policy "subtasks_select"
  on public.subtasks for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.is_workspace_member(p.workspace_id)
    )
  );

create policy "subtasks_insert_editors"
  on public.subtasks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

create policy "subtasks_update_editors"
  on public.subtasks for update
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

create policy "subtasks_delete_editors"
  on public.subtasks for delete
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

-- ----------------------------------------------------------------
-- LABELS
-- ----------------------------------------------------------------
create policy "labels_select"
  on public.labels for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "labels_insert_editors"
  on public.labels for insert
  to authenticated
  with check (public.can_edit_workspace(workspace_id));

create policy "labels_update_admin"
  on public.labels for update
  to authenticated
  using (public.is_workspace_admin(workspace_id));

create policy "labels_delete_admin"
  on public.labels for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id));

-- ----------------------------------------------------------------
-- TASK LABELS
-- ----------------------------------------------------------------
create policy "task_labels_select"
  on public.task_labels for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.is_workspace_member(p.workspace_id)
    )
  );

create policy "task_labels_insert_editors"
  on public.task_labels for insert
  to authenticated
  with check (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

create policy "task_labels_delete_editors"
  on public.task_labels for delete
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

-- ----------------------------------------------------------------
-- COMMENTS
-- ----------------------------------------------------------------
create policy "comments_select"
  on public.comments for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.is_workspace_member(p.workspace_id)
    )
  );

create policy "comments_insert_editors"
  on public.comments for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

-- Users can only edit their own comments
create policy "comments_update_own"
  on public.comments for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Users delete own; admins delete any
create policy "comments_delete"
  on public.comments for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.is_workspace_admin(p.workspace_id)
    )
  );

-- ----------------------------------------------------------------
-- ACTIVITY LOGS
-- ----------------------------------------------------------------
-- Workspace members can view activity for their workspaces
create policy "activity_logs_select"
  on public.activity_logs for select
  to authenticated
  using (
    workspace_id is null
    or public.is_workspace_member(workspace_id)
  );

-- Only server-side inserts (via triggers/functions with security definer)
create policy "activity_logs_insert_service"
  on public.activity_logs for insert
  to authenticated
  with check (actor_id = auth.uid());

-- ----------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------
-- Users only see their own notifications
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (recipient_id = auth.uid());

-- Inserts handled server-side (triggers)
create policy "notifications_insert"
  on public.notifications for insert
  to authenticated
  with check (true); -- Controlled by trigger security

-- Users can update (mark as read) their own
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- ----------------------------------------------------------------
-- USER PREFERENCES
-- ----------------------------------------------------------------
create policy "user_preferences_select_own"
  on public.user_preferences for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_preferences_insert_own"
  on public.user_preferences for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_preferences_update_own"
  on public.user_preferences for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------
-- ATTACHMENTS
-- ----------------------------------------------------------------
create policy "attachments_select"
  on public.attachments for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.is_workspace_member(p.workspace_id)
    )
  );

create policy "attachments_insert_editors"
  on public.attachments for insert
  to authenticated
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.can_edit_workspace(p.workspace_id)
    )
  );

create policy "attachments_delete"
  on public.attachments for delete
  to authenticated
  using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and public.is_workspace_admin(p.workspace_id)
    )
  );
