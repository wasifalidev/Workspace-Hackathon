'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch } from '@/store'
import { addWorkspace, setCurrentWorkspace } from '@/store/slices/workspaceSlice'
import { toast } from 'sonner'
import { AppIcon, WORKSPACE_SVG_ICONS } from '@/components/ui/AppIcon'

const COLOR_OPTIONS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

export default function NewWorkspacePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('domain')
  const [color, setColor] = useState('#6366F1')
  const [loading, setLoading] = useState(false)

  function toSlug(v: string) {
    return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 50)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) { toast.error('Name and slug are required'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase.from('workspaces').insert({
      name: name.trim(), slug: slug.trim(), icon, color, description: description.trim() || null, owner_id: user.id,
    }).select().single()

    if (error) { toast.error(error.message); setLoading(false); return }

    const ws = { id: data.id, name: data.name, slug: data.slug, icon: data.icon, color: data.color, description: data.description, defaultView: data.default_view, ownerId: data.owner_id, role: 'owner' as const, createdAt: data.created_at }
    dispatch(addWorkspace(ws))
    dispatch(setCurrentWorkspace(ws))
    toast.success(`Workspace "${name}" created!`)
    router.push('/dashboard')
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
          Create Workspace
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
          Set up a new organization, team, or project workspace.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Preview */}
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-white"
            style={{ background: color }}>
            <AppIcon name={icon} size={26} color="white" />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--color-on-surface)' }}>{name || 'Workspace Name'}</div>
            <div className="text-xs font-mono" style={{ color: 'var(--color-on-surface-variant)' }}>/{slug || 'workspace-slug'}</div>
          </div>
        </div>

        {/* SVG Icon picker */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Workspace Icon (SVG)</label>
          <div className="grid grid-cols-6 gap-2">
            {WORKSPACE_SVG_ICONS.map(w => (
              <button key={w.id} type="button" onClick={() => setIcon(w.id)}
                title={w.label}
                className="h-10 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: icon === w.id ? `color-mix(in srgb, ${color} 25%, var(--color-surface-container-high))` : 'var(--color-surface-container)',
                  border: `1.5px solid ${icon === w.id ? color : 'var(--color-outline-variant)'}`,
                  color: icon === w.id ? color : 'var(--color-on-surface)',
                }}>
                <AppIcon name={w.id} size={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className="w-8 h-8 rounded-lg transition-all"
                style={{ background: c, border: `3px solid ${color === c ? 'white' : 'transparent'}`, boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Name *</label>
          <input type="text" value={name} onChange={e => { setName(e.target.value); setSlug(toSlug(e.target.value)) }} required maxLength={80} placeholder="e.g. Engineering Team" className="input-base w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Slug *</label>
          <div className="flex items-center">
            <span className="px-3 h-9 flex items-center text-sm rounded-l-lg border border-r-0"
              style={{ background: 'var(--color-surface-container)', color: 'var(--color-outline)', borderColor: 'var(--color-outline-variant)' }}>/</span>
            <input type="text" value={slug} onChange={e => setSlug(toSlug(e.target.value))} required placeholder="engineering-team"
              className="flex-1 h-9 px-3 text-sm font-mono rounded-r-lg border"
              style={{ background: 'var(--color-surface-container-lowest)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)', outline: 'none' }} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-on-surface-variant)' }}>Description <span style={{ color: 'var(--color-outline)' }}>(optional)</span></label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this workspace for?" rows={3}
            className="input-base w-full resize-none pt-2.5" style={{ height: 'auto' }} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="btn-ghost flex-1 h-10 text-sm font-medium rounded-lg" style={{ border: '1px solid var(--color-outline-variant)' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="btn-primary flex-1 h-10 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <span className="material-symbols-outlined text-base">progress_activity</span> : <span className="material-symbols-outlined text-base">add_business</span>}
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </form>
    </div>
  )
}
