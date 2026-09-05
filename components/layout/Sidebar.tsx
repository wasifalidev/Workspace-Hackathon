'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { setCurrentWorkspace } from '@/store/slices/workspaceSlice'
import { createClient } from '@/lib/supabase/client'
import { clearAuth } from '@/store/slices/authSlice'
import { toast } from 'sonner'
import { AppIcon } from '@/components/ui/AppIcon'
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
  const [wsMenuOpen, setWsMenuOpen] = useState(false)
  const wsMenuRef = useRef<HTMLDivElement>(null)

  // Close workspace switcher menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wsMenuRef.current && !wsMenuRef.current.contains(e.target as Node)) {
        setWsMenuOpen(false)
      }
    }
    if (wsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [wsMenuOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    dispatch(clearAuth())
    toast.success('Signed out')
    router.push('/')
  }

  function handleSwitchWorkspace(targetWs: Workspace) {
    dispatch(setCurrentWorkspace(targetWs))
    setWsMenuOpen(false)
    toast.success(`Switched to ${targetWs.name}`)
    router.push(`/${targetWs.slug}/projects`)
  }

  function handleNavClick() {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && !sidebarCollapsed) {
      dispatch(toggleSidebar())
    }
  }

  const w = currentWorkspace?.slug ?? '_'

  return (
    <>
      {/* ── Mobile Backdrop Overlay ── */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ${
          sidebarCollapsed
            ? '-translate-x-full md:translate-x-0 md:w-16'
            : 'translate-x-0 w-64 md:w-64 shadow-2xl md:shadow-none'
        }`}
        style={{
          background: 'var(--color-surface-container-low)',
          borderRight: '1px solid var(--color-outline-variant)',
        }}
      >
        {/* ── Header: Workspace switcher ── */}
        <div className="relative flex items-center justify-between px-3 flex-shrink-0" ref={wsMenuRef}
          style={{ height: '3.25rem', background: 'var(--color-sub-surface)', borderBottom: '1px solid var(--color-outline-variant)' }}>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="md:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface mr-1"
            type="button"
            title="Close menu"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        {!sidebarCollapsed ? (
          <button
            onClick={() => setWsMenuOpen(!wsMenuOpen)}
            className="flex items-center gap-2 min-w-0 text-left flex-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-high/60"
            style={{ color: 'var(--color-on-surface)' }}
            type="button"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs"
              style={{ background: currentWorkspace?.color ?? 'var(--color-primary)', color: 'var(--color-on-primary)', opacity: 0.9 }}>
              {currentWorkspace ? <AppIcon name={currentWorkspace.icon || 'domain'} size={14} color="white" /> : 'W'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{currentWorkspace?.name ?? 'Select Workspace'}</div>
              <div className="text-[10px] truncate" style={{ color: 'var(--color-on-surface-variant)' }}>
                {user?.email?.split('@')[0]}
              </div>
            </div>
            <span className={`material-symbols-outlined text-lg flex-shrink-0 transition-transform duration-200 ${wsMenuOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--color-on-surface-variant)' }}>
              unfold_more
            </span>
          </button>
        ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto font-bold text-xs cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: currentWorkspace?.color ?? 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              title={currentWorkspace?.name ?? 'Switch Workspace'}
            >
              {currentWorkspace ? <AppIcon name={currentWorkspace.icon || 'domain'} size={16} color="white" /> : 'W'}
            </div>
        )}

        {/* ── Workspace Dropdown Popover ── */}
        {wsMenuOpen && (
          <div
            className="absolute top-full left-2 right-2 mt-1 z-50 rounded-xl shadow-2xl overflow-hidden py-1 border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              background: 'var(--color-popover, var(--color-surface))',
              borderColor: 'var(--color-outline-variant)',
              width: sidebarCollapsed ? '240px' : 'auto',
              minWidth: '220px',
            }}
          >
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider border-b border-outline-variant/40" style={{ color: 'var(--color-on-surface-variant)' }}>
              Your Workspaces ({workspaces.length})
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {workspaces.map(ws => {
                const isCurrent = currentWorkspace?.id === ws.id
                return (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitchWorkspace(ws)}
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                      isCurrent
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 font-bold"
                        style={{ background: ws.color || 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                      >
                        <AppIcon name={ws.icon || 'domain'} size={13} color="white" />
                      </div>
                      <div className="truncate">
                        <div className="truncate">{ws.name}</div>
                        <div className="text-[10px] text-outline font-mono truncate">/{ws.slug}</div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="material-symbols-outlined text-sm text-primary">check</span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-outline-variant/40 pt-1 mt-1">
              <Link
                href="/workspaces/new"
                onClick={() => setWsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Create New Workspace</span>
              </Link>
              <Link
                href="/workspaces"
                onClick={() => setWsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-base">domain</span>
                <span>Manage All Workspaces</span>
              </Link>
            </div>
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
            <Link key={href} href={href} onClick={handleNavClick}
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
              <Link href="/workspaces/new-project" onClick={handleNavClick}>
                <span className="material-symbols-outlined text-base hover:text-white transition-colors">add</span>
              </Link>
            </div>
            <div className="space-y-0.5">
              {projects.slice(0, 8).map(project => (
                <div key={project.id}>
                  <Link href={`/${w}/${project.id}/board`} onClick={handleNavClick}
                    className={`nav-item ${isActive(`/${w}/${project.id}`) ? 'active' : ''}`}>
                    <AppIcon name={project.icon || 'folder'} size={16} color={project.color || 'var(--color-primary)'} className="flex-shrink-0" />
                    <span className="truncate">{project.name}</span>
                    <span className="material-symbols-outlined text-base ml-auto flex-shrink-0" style={{ color: 'var(--color-outline)' }}>expand_more</span>
                  </Link>
                  {isActive(`/${w}/${project.id}`) && (
                    <div className="pl-7 space-y-0.5">
                      {[['view_kanban', 'Board', 'board'], ['format_list_bulleted', 'List', 'list'], ['calendar_today', 'Calendar', 'calendar']].map(([icon, label, view]) => (
                        <Link key={view} href={`/${w}/${project.id}/${view}`} onClick={handleNavClick}
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
        style={{ background: 'var(--color-sub-surface)', borderTop: '1px solid var(--color-outline-variant)' }}>
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
  </>
  )
}
