import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient, { DashboardProject, DashboardTask } from '@/components/dashboard/DashboardClient'
import type { Workspace } from '@/store/slices/workspaceSlice'

export const metadata = {
  title: 'Universal Dashboard | Wasif\'s Workspace',
  description: 'Executive command center with multi-workspace analytics and interactive tasks',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // 1. Fetch all workspaces the user belongs to
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('role, workspaces(*)')
    .eq('user_id', user.id)

  const workspaces: Workspace[] = (memberships ?? []).map((m: any) => {
    const rawWs = Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces
    if (!rawWs) return null
    return {
      id: rawWs.id,
      name: rawWs.name,
      slug: rawWs.slug,
      icon: rawWs.icon ?? null,
      color: rawWs.color ?? null,
      description: rawWs.description ?? null,
      defaultView: rawWs.default_view ?? 'board',
      ownerId: rawWs.owner_id,
      role: m.role,
      createdAt: rawWs.created_at,
    } as Workspace
  }).filter(Boolean) as Workspace[]

  // If user has no workspaces yet, redirect to create their first
  if (workspaces.length === 0) {
    redirect('/workspaces/new')
  }

  const workspaceIds = workspaces.map(w => w.id)
  const workspaceMap = new Map(workspaces.map(w => [w.id, w]))

  // 2. Fetch all projects across all workspaces
  const { data: rawProjects } = await supabase
    .from('projects')
    .select('*')
    .in('workspace_id', workspaceIds)
    .order('created_at', { ascending: false })

  const projects: DashboardProject[] = (rawProjects ?? []).map((p: any) => {
    const ws = workspaceMap.get(p.workspace_id)
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      icon: p.icon,
      color: p.color,
      workspaceId: p.workspace_id,
      workspaceSlug: ws?.slug || '_',
      workspaceName: ws?.name || 'Workspace',
      createdAt: p.created_at,
    }
  })

  const projectIds = projects.map(p => p.id)
  const projectMap = new Map(projects.map(p => [p.id, p]))

  // 3. Fetch all tasks across all projects
  const { data: rawTasks } = projectIds.length > 0
    ? await supabase
        .from('tasks')
        .select('id, title, status, priority, due_date, estimate_points, project_id, created_at')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const tasks: DashboardTask[] = (rawTasks ?? []).map((t: any) => {
    const proj = projectMap.get(t.project_id)
    const ws = proj ? workspaceMap.get(proj.workspaceId) : null
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date,
      estimatePoints: t.estimate_points,
      projectId: t.project_id,
      projectName: proj?.name || 'General',
      projectColor: proj?.color || null,
      projectIcon: proj?.icon || null,
      workspaceId: ws?.id || '',
      workspaceSlug: ws?.slug || '_',
      workspaceName: ws?.name || 'Workspace',
    }
  })

  // 4. Fetch recent activity across all user workspaces
  const { data: recentActivity } = await supabase
    .from('activity_logs')
    .select('id, action, metadata, created_at, actor:profiles(full_name, avatar_url)')
    .in('workspace_id', workspaceIds)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <DashboardClient
      initialWorkspaces={workspaces}
      initialProjects={projects}
      initialTasks={tasks}
      recentActivity={recentActivity ?? []}
      userName={profile?.full_name || user.email?.split('@')[0] || ''}
    />
  )
}
