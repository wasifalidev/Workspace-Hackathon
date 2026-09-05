import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import type { Workspace } from '@/store/slices/workspaceSlice'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Server-side auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch workspaces (user is a member of)
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

  // Default to first workspace
  const currentWorkspace: Workspace | null = workspaces[0] ?? null

  // Fetch projects for current workspace
  const { data: rawProjects } = currentWorkspace?.id
    ? await supabase.from('projects').select('*').eq('workspace_id', currentWorkspace.id).eq('status', 'active').order('created_at', { ascending: false })
    : { data: [] }

  const projects = (rawProjects ?? []).map((p: any) => ({
    id: p.id,
    workspaceId: p.workspace_id,
    name: p.name,
    description: p.description,
    icon: p.icon,
    color: p.color,
    status: p.status,
    createdBy: p.created_by,
    createdAt: p.created_at,
  }))

  return (
    <AppShell
      initialUser={profile ? {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        isPlatformAdmin: profile.is_platform_admin,
      } : null}
      initialWorkspaces={workspaces}
      initialCurrentWorkspace={currentWorkspace}
      initialProjects={projects}
    >
      {children}
    </AppShell>
  )
}
