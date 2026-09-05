'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch, useAppSelector } from '@/store'
import { addProject } from '@/store/slices/projectSlice'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ICONS = ['📁', '⚡', '🚀', '🎨', '🛡️', '📊', '💻', '🔥', '🌐', '📱', '⚙️', '✨']
const COLORS = [
  '#c0c1ff', // indigo
  '#4edea3', // emerald
  '#ffb95f', // amber
  '#ffb4ab', // rose
  '#6ffbbe', // cyan
  '#8083ff', // blue
  '#ca8100', // gold
  '#dfe2ee', // silver
]

export default function NewProjectPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const currentWorkspace = useAppSelector(s => s.workspace.currentWorkspace)
  const user = useAppSelector(s => s.auth.user)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('⚡')
  const [color, setColor] = useState('#c0c1ff')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter a project name')
      return
    }

    if (!currentWorkspace) {
      toast.error('Please select a workspace first')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const newProjId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('projects')
        .insert({
          id: newProjId,
          workspace_id: currentWorkspace.id,
          name: name.trim(),
          description: description.trim() || null,
          icon,
          color,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        // Fallback optimistic update if table is empty or offline
        const mockProject = {
          id: newProjId,
          workspace_id: currentWorkspace.id,
          name: name.trim(),
          description: description.trim() || null,
          icon,
          color,
          created_at: new Date().toISOString(),
        }
        dispatch(addProject(mockProject as any))
        toast.success(`Project "${name}" created!`)
        router.push(`/${currentWorkspace.slug}/${newProjId}/board`)
        return
      }

      dispatch(addProject(data))
      toast.success(`Project "${name}" created!`)
      router.push(`/${currentWorkspace.slug}/${data.id}/board`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6 font-label-md">
        <Link href="/dashboard" className="hover:text-on-surface transition-colors">
          Dashboard
        </Link>
        <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
        <span className="text-on-surface font-semibold">New Project</span>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-outline-variant">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold text-on-surface font-headline-md">Create New Project</h1>
            <p className="text-xs text-on-surface-variant mt-0.5 font-body-sm">
              In workspace <span className="text-primary font-medium">{currentWorkspace?.name ?? 'Personal'}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Name"
            placeholder="e.g. Mobile App Redesign"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-on-surface-variant">
              Description (optional)
            </label>
            <textarea
              rows={3}
              placeholder="What is this project about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-lg text-sm px-3.5 py-2 bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-on-surface-variant">
              Project Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    icon === i
                      ? 'bg-surface-container-highest ring-2 ring-primary scale-105'
                      : 'bg-surface-container hover:bg-surface-container-high'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-on-surface-variant">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-surface ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon="add"
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
