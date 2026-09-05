'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store'
import { closeCommandPalette } from '@/store/slices/uiSlice'

const COMMANDS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Go to Dashboard', path: '/dashboard', group: 'Navigate' },
  { id: 'my-tasks', icon: 'check_circle', label: 'Go to My Tasks', path: '/my-tasks', group: 'Navigate' },
  { id: 'notifications', icon: 'notifications', label: 'Go to Notifications', path: '/notifications', group: 'Navigate' },
  { id: 'settings', icon: 'settings', label: 'Open Settings', path: '/settings', group: 'Navigate' },
  { id: 'admin', icon: 'admin_panel_settings', label: 'Open Admin Panel', path: '/admin', group: 'Navigate' },
  { id: 'new-task', icon: 'add_task', label: 'Create New Task', path: '/dashboard/tasks/new', group: 'Create' },
  { id: 'new-project', icon: 'create_new_folder', label: 'Create New Project', path: '/workspaces/new-project', group: 'Create' },
  { id: 'new-workspace', icon: 'add_business', label: 'Create New Workspace', path: '/workspaces/new', group: 'Create' },
]

export default function CommandPalette() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const isOpen = useAppSelector(s => s.ui.commandPaletteOpen)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.group.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setSelected(0) }
  }, [isOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!isOpen) return
      if (e.key === 'Escape') { dispatch(closeCommandPalette()); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && filtered[selected]) {
        router.push(filtered[selected].path)
        dispatch(closeCommandPalette())
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, filtered, selected, dispatch, router])

  if (!isOpen) return null

  const groups = [...new Set(filtered.map(c => c.group))]

  return (
    <div className="modal-backdrop animate-fade-in" onClick={() => dispatch(closeCommandPalette())}>
      <div
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl rounded-2xl overflow-hidden animate-scale-in"
        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.65)', zIndex: 60 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
          <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-outline)' }}>search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Search commands, pages, tasks..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{ color: 'var(--color-on-surface)' }}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}>Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-outline)' }}>No commands found</div>
          ) : (
            groups.map(group => (
              <div key={group} className="mb-1">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-outline)' }}>{group}</div>
                {filtered.filter(c => c.group === group).map((cmd, i) => {
                  const globalIdx = filtered.indexOf(cmd)
                  return (
                    <button key={cmd.id} type="button"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left"
                      style={{ background: selected === globalIdx ? 'var(--color-surface-container-high)' : 'transparent', color: 'var(--color-on-surface)' }}
                      onMouseEnter={() => setSelected(globalIdx)}
                      onClick={() => { router.push(cmd.path); dispatch(closeCommandPalette()) }}>
                      <span className="material-symbols-outlined text-lg flex-shrink-0" style={{ color: 'var(--color-primary)' }}>{cmd.icon}</span>
                      <span>{cmd.label}</span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 text-[10px]"
          style={{ borderTop: '1px solid var(--color-outline-variant)', color: 'var(--color-outline)' }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="font-mono bg-surface-container-high px-1 rounded">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="font-mono bg-surface-container-high px-1 rounded">↵</kbd> open</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="font-mono px-1 rounded" style={{ background: 'var(--color-surface-container-high)' }}>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
