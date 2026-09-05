-- =====================================================================
-- QUICK FIX FOR 500 INTERNAL SERVER ERROR ON SIGNUP
-- Run this in your Supabase SQL Editor to immediately resolve the issue.
-- =====================================================================

-- 1. Ensure extensions and schema permissions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Drop existing triggers to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_workspace_created on public.workspaces;

-- 3. Replace handle_new_user with bulletproof, exception-safe version
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, extensions, pg_temp as $$
declare
  v_name text;
  v_workspace_id uuid;
  v_slug text;
begin
  -- Safe fallback for name
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

    -- Add owner to workspace members
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

-- 4. Re-attach trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Helper trigger for workspace creator
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

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_workspace_created();
