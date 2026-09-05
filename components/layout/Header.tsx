'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store'
import { toggleSidebar, openCommandPalette } from '@/store/slices/uiSlice'
import { createClient } from '@/lib/supabase/client'

import Logo from '@/components/ui/Logo'

export default function Header() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector(s => s.auth.user)
  const currentWorkspace = useAppSelector(s => s.workspace.currentWorkspace)
  const unreadCount = useAppSelector(s => s.notification.unreadCount)
  const sidebarCollapsed = useAppSelector(s => s.ui.sidebarCollapsed)
  const [searchValue, setSearchValue] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Global keyboard shortcut for command palette
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        dispatch(openCommandPalette())
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [dispatch])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-5 gap-4"
      style={{
        left: sidebarCollapsed ? '4rem' : '16rem',
        height: '3.25rem',
        background: 'rgba(10,14,22,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-outline-variant)',
        transition: 'left 0.3s ease',
      }}
    >
      {/* Left: toggle + brand + active workspace */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={() => dispatch(toggleSidebar())} type="button"
          className="btn-ghost p-1.5 rounded-lg flex-shrink-0"
          style={{ color: 'var(--color-on-surface-variant)' }}>
          <span className="material-symbols-outlined text-xl">menu_open</span>
        </button>
        <Logo size="xs" href="/dashboard" textClassName="hidden sm:inline" />

        {currentWorkspace && (
          <Link
            href={`/${currentWorkspace.slug}/projects`}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-surface-container-high transition-colors"
            style={{
              background: 'var(--color-surface-container)',
              border: '1px solid var(--color-outline-variant)',
              color: 'var(--color-on-surface)',
            }}
            title={`Active Workspace: ${currentWorkspace.name}`}
          >
            <span>{currentWorkspace.icon || '🏢'}</span>
            <span className="truncate max-w-[130px] font-semibold">{currentWorkspace.name}</span>
          </Link>
        )}
      </div>

      {/* Center: Search bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-lg" style={{ color: 'var(--color-outline)' }}>search</span>
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onFocus={() => dispatch(openCommandPalette())}
            placeholder="Search tasks, projects, docs..."
            className="w-full h-8 pl-9 pr-14 rounded-lg text-sm transition-all"
            style={{
              background: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-outline-variant)',
              color: 'var(--color-on-surface)',
            }}
            readOnly
          />
          <kbd className="absolute right-3 text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface-variant)' }}>⌘K</kbd>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Online indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: 'rgba(78,222,163,0.1)', color: 'var(--color-secondary)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-secondary)' }}></span>
          <span>Online</span>
        </div>

        {/* Notifications */}
        <Link href="/notifications" className="relative btn-ghost p-1.5 rounded-lg">
          <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-on-surface-variant)' }}>notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setUserMenuOpen(!userMenuOpen)} type="button"
            className="flex items-center gap-2 p-1 rounded-lg transition-colors"
            style={{ color: 'var(--color-on-surface-variant)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
              {user?.fullName ? user.fullName[0].toUpperCase() : user?.email?.[0].toUpperCase() ?? 'U'}
            </div>
            <span className="material-symbols-outlined text-lg hidden sm:block">expand_more</span>
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden animate-scale-in z-50"
              style={{ background: 'var(--color-surface-container-highest)', border: '1px solid var(--color-outline-variant)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-on-surface)' }}>
                  {user?.fullName ?? 'User'}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--color-on-surface-variant)' }}>{user?.email}</div>
              </div>
              <div className="p-1.5">
                {[
                  { href: '/settings', icon: 'person', label: 'Profile' },
                  { href: '/settings#preferences', icon: 'tune', label: 'Preferences' },
                  ...(user?.isPlatformAdmin ? [{ href: '/admin', icon: 'admin_panel_settings', label: 'Admin Panel' }] : []),
                ].map(({ href, icon, label }) => (
                  <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{ color: 'var(--color-on-surface-variant)' }}>
                    <span className="material-symbols-outlined text-base">{icon}</span>
                    {label}
                  </Link>
                ))}
                <button onClick={handleLogout} type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mt-1"
                  style={{ color: 'var(--color-error)', borderTop: '1px solid var(--color-outline-variant)', marginTop: '4px', paddingTop: '8px' }}>
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
