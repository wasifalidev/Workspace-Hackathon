'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { createClient } from '@/lib/supabase/client'
import { clearAuth } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import type { Project } from '@/store/slices/projectSlice'
import type { Workspace } from '@/store/slices/workspaceSlice'

interface SidebarProps {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  projects: Project[]
}

export default function Sidebar({ workspaces, currentWorkspace, projects }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const sidebarCollapsed = useAppSelector(s => s.ui.sidebarCollapsed)
  const user = useAppSelector(s => s.auth.user)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    dispatch(clearAuth())
    toast.success('Signed out')
    router.push('/')
  }

  const w = currentWorkspace?.slug ?? '_'

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden transition-all duration-300"
      style={{
        width: sidebarCollapsed ? '4rem' : '16rem',
        background: 'var(--color-surface-container-low)',
        borderRight: '1px solid var(--color-outline-variant)',
      }}
    >
      {/* ── Header: Workspace switcher ── */}
      <div className="flex items-center justify-between px-3 flex-shrink-0"
        style={{ height: '3.25rem', background: 'rgba(10,14,22,0.5)', borderBottom: '1px solid var(--color-outline-variant)' }}>
        {!sidebarCollapsed && (
          <button className="flex items-center gap-2 min-w-0 text-left flex-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-high/60"
            style={{ color: 'var(--color-on-surface)' }} type="button">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs"
              style={{ background: currentWorkspace?.color ?? 'var(--color-primary)', color: 'var(--color-on-primary)', opacity: 0.9 }}>
              {currentWorkspace ? currentWorkspace.name[0].toUpperCase() : 'W'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{currentWorkspace?.name ?? 'Select Workspace'}</div>
              <div className="text-[10px] truncate" style={{ color: 'var(--color-on-surface-variant)' }}>
                {user?.email?.split('@')[0]}
              </div>
            </div>
            <span className="material-symbols-outlined text-lg flex-shrink-0" style={{ color: 'var(--color-on-surface-variant)' }}>unfold_more</span>
          </button>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto font-bold text-xs"
            style={{ background: currentWorkspace?.color ?? 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
            {currentWorkspace ? currentWorkspace.name[0].toUpperCase() : 'W'}
          </div>
        )}
      </div>

      {/* ── New Task button ── */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2.5 flex-shrink-0">
          <Link href="/dashboard/tasks/new"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-sm transition-all"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">add</span>
              <span>New Task</span>
            </div>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(0,0,0,0.2)' }}>C</kbd>
          </Link>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-3">
        {/* Core nav */}
        <div className="space-y-0.5">
          {[
            { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
            { href: '/my-tasks', icon: 'check_circle', label: 'My Tasks' },
            { href: '/notifications', icon: 'notifications', label: 'Notifications' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className={`nav-item ${isActive(href) ? 'active' : ''}`}>
              <span className="material-symbols-outlined text-lg flex-shrink-0">{icon}</span>
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </Link>
          ))}
        </div>

        {/* Projects */}
        {!sidebarCollapsed && projects.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 py-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>
              <span className="text-[10px] font-semibold uppercase tracking-widest">Projects</span>
              <Link href="/workspaces/new-project">
                <span className="material-symbols-outlined text-base hover:text-white transition-colors">add</span>
              </Link>
            </div>
            <div className="space-y-0.5">
              {projects.slice(0, 8).map(project => (
                <div key={project.id}>
                  <Link href={`/${w}/${project.id}/board`}
                    className={`nav-item ${isActive(`/${w}/${project.id}`) ? 'active' : ''}`}>
                    <span className="text-base flex-shrink-0">{project.icon ?? '📁'}</span>
                    <span className="truncate">{project.name}</span>
                    <span className="material-symbols-outlined text-base ml-auto flex-shrink-0" style={{ color: 'var(--color-outline)' }}>expand_more</span>
                  </Link>
                  {isActive(`/${w}/${project.id}`) && (
                    <div className="pl-7 space-y-0.5">
                      {[['view_kanban', 'Board', 'board'], ['format_list_bulleted', 'List', 'list'], ['calendar_today', 'Calendar', 'calendar']].map(([icon, label, view]) => (
                        <Link key={view} href={`/${w}/${project.id}/${view}`}
                          className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors ${isActive(`/${w}/${project.id}/${view}`) ? 'active' : ''}`}
                          style={{ color: isActive(`/${w}/${project.id}/${view}`) ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)' }}>
                          <span className="material-symbols-outlined text-sm">{icon}</span>
                          <span>{label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 px-2 py-2 space-y-1"
        style={{ background: 'rgba(10,14,22,0.5)', borderTop: '1px solid var(--color-outline-variant)' }}>
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between px-2 py-1.5 text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-secondary)' }}></span>
              <span>Synced to Supabase</span>
            </div>
            <span className="material-symbols-outlined text-sm">cloud_done</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Link href="/settings" className="nav-item flex-1" title="Settings">
            <span className="material-symbols-outlined text-lg">settings</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>
          <button onClick={handleLogout} className="nav-item" title="Sign out" type="button">
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
