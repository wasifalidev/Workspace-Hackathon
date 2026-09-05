-- ============================================================
-- 016_functions_triggers.sql
-- Database functions and triggers for automation
-- ============================================================

-- ----------------------------------------------------------------
-- Auto-create profile on user signup
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  -- Create default preferences
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Attach trigger to auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- Auto-add workspace owner as member with 'owner' role
-- ----------------------------------------------------------------
create or replace function public.handle_workspace_created()
returns trigger language plpgsql security definer as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (workspace_id, user_id) do nothing;
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_workspace_created();

-- ----------------------------------------------------------------
-- Log activity when a task is created
-- ----------------------------------------------------------------
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

create trigger on_task_created
  after insert on public.tasks
  for each row execute function public.log_task_created();

-- ----------------------------------------------------------------
-- Log activity when task status changes
-- ----------------------------------------------------------------
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

  if old.priority <> new.priority then
    insert into public.activity_logs (workspace_id, project_id, task_id, actor_id, action, metadata)
    values (
      v_workspace_id,
      new.project_id,
      new.id,
      auth.uid(),
      'task_priority_changed',
      jsonb_build_object('old_priority', old.priority, 'new_priority', new.priority)
    );
  end if;

  if old.assignee_id is distinct from new.assignee_id then
    insert into public.activity_logs (workspace_id, project_id, task_id, actor_id, action, metadata)
    values (
      v_workspace_id,
      new.project_id,
      new.id,
      auth.uid(),
      'task_assignee_changed',
      jsonb_build_object('old_assignee', old.assignee_id, 'new_assignee', new.assignee_id)
    );
  end if;

  return new;
end;
$$;

create trigger on_task_updated
  after update on public.tasks
  for each row execute function public.log_task_status_change();

-- ----------------------------------------------------------------
-- Notify user when task is assigned to them
-- ----------------------------------------------------------------
create or replace function public.notify_task_assigned()
returns trigger language plpgsql security definer as $$
declare
  v_actor_name text;
  v_task_title text;
begin
  if new.assignee_id is not null and (old.assignee_id is null or old.assignee_id <> new.assignee_id) then
    -- Don't notify if assigning to self
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

create trigger on_task_assigned
  after update on public.tasks
  for each row execute function public.notify_task_assigned();

-- ----------------------------------------------------------------
-- Notify mentioned users in comments
-- ----------------------------------------------------------------
create or replace function public.notify_comment_mentions()
returns trigger language plpgsql security definer as $$
declare
  v_mentioned_id uuid;
  v_commenter_name text;
begin
  if new.mentions is not null and array_length(new.mentions, 1) > 0 then
    select full_name into v_commenter_name from public.profiles where id = new.user_id;

    foreach v_mentioned_id in array new.mentions loop
      if v_mentioned_id <> new.user_id then
        insert into public.notifications (recipient_id, actor_id, type, title, message, task_id)
        values (
          v_mentioned_id,
          new.user_id,
          'comment_mentioned',
          'You were mentioned in a comment',
          coalesce(v_commenter_name, 'Someone') || ' mentioned you in a comment',
          new.task_id
        );
      end if;
    end loop;
  end if;
  return new;
end;
$$;

create trigger on_comment_mention
  after insert on public.comments
  for each row execute function public.notify_comment_mentions();

-- ----------------------------------------------------------------
-- Function: Get dashboard stats for a workspace
-- ----------------------------------------------------------------
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
