import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Workspaces' }

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('role, workspaces(id, name, slug, icon, color, description, owner_id, created_at)')
    .eq('user_id', user.id)

  const workspaces = (memberships ?? []).map((m: Record<string, unknown>) => ({
    ...(m.workspaces as Record<string, unknown>),
    role: m.role,
  }))

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>Workspaces</h1>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Manage all your organizations and teams</p>
        </div>
        <Link href="/workspaces/new"
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold">
          <span className="material-symbols-outlined text-lg">add</span>
          New Workspace
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: 'var(--color-outline)' }}>corporate_fare</span>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-on-surface)' }}>No workspaces yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-on-surface-variant)' }}>Create your first workspace to get started</p>
          <Link href="/workspaces/new" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold">
            <span className="material-symbols-outlined text-lg">add</span>
            Create Workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws: Record<string, unknown>) => (
            <Link key={ws.id as string} href={`/${ws.slug as string}/projects`}
              className="rounded-xl p-5 group hover:scale-[1.01] hover:border-primary/60 transition-all block shadow-sm"
              style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 font-semibold shadow-sm"
                  style={{ background: (ws.color as string) ?? 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                  {ws.icon ? String(ws.icon) : (ws.name as string)[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm mb-0.5 truncate group-hover:text-primary transition-colors"
                    style={{ color: 'var(--color-on-surface)' }}>{ws.name as string}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(78,222,163,0.12)', color: 'var(--color-secondary)' }}>
                    Active Workspace
                  </span>
                </div>
                <span
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.location.href = `/workspaces/${ws.slug as string}/settings`
                  }}
                  className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  title="Workspace Settings & Delete"
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                </span>
              </div>
              {Boolean(ws.description) && (
                <p className="text-xs line-clamp-2 mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>{ws.description as string}</p>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40">
                <span className="text-xs font-mono" style={{ color: 'var(--color-outline)' }}>/{ws.slug as string}</span>
                <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Workspace</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
          {/* Create new card */}
          <Link href="/workspaces/new"
            className="rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-colors group"
            style={{ border: '2px dashed var(--color-outline-variant)', color: 'var(--color-on-surface-variant)', minHeight: '140px' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'var(--color-surface-container)' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--color-on-surface-variant)' }}>add</span>
            </div>
            <span className="text-sm font-medium">Create New Workspace</span>
          </Link>
        </div>
      )}
    </div>
  )
}
