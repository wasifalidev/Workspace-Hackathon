'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch } from '@/store'
import { updateProject, removeProject, Project } from '@/store/slices/projectSlice'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface EditProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  workspaceSlug?: string
  onDeleted?: () => void
}

const EMOJI_OPTIONS = ['📁', '⚡', '🚀', '🎯', '🛡️', '💡', '🔥', '🌊', '🎨', '🔬', '📱', '🌐']
const COLOR_OPTIONS = ['#c0c1ff', '#4edea3', '#ffb95f', '#6366F1', '#0EA5E9', '#EC4899', '#14B8A6', '#F59E0B']

export function EditProjectModal({
  project,
  isOpen,
  onClose,
  workspaceSlug,
  onDeleted,
}: EditProjectModalProps) {
  const dispatch = useAppDispatch()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📁')
  const [color, setColor] = useState('#c0c1ff')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name || '')
      setDescription(project.description || '')
      setIcon(project.icon || '📁')
      setColor(project.color || '#c0c1ff')
    }
  }, [project])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!project || !name.trim()) {
      toast.error('Project name is required')
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          icon,
          color,
        })
        .eq('id', project.id)

      if (error) throw error

      dispatch(
        updateProject({
          id: project.id,
          name: name.trim(),
          description: description.trim() || null,
          icon,
          color,
        })
      )
      toast.success('Project updated successfully')
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!project) return
    if (!confirm(`Are you sure you want to permanently delete "${project.name}" and all of its tasks?`)) {
      return
    }

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('projects').delete().eq('id', project.id)
      if (error) throw error

      dispatch(removeProject(project.id))
      toast.success(`Project "${project.name}" deleted`)
      onClose()
      onDeleted?.()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  if (!project) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Settings" maxWidth="md">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Preview card */}
        <div
          className="flex items-center gap-3 p-3.5 rounded-xl border"
          style={{
            background: 'var(--color-surface-container)',
            borderColor: 'var(--color-outline-variant)',
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ background: `${color}20`, color }}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-on-surface truncate">{name || 'Project Name'}</h4>
            <p className="text-xs text-on-surface-variant truncate">
              {description || 'No description provided'}
            </p>
          </div>
        </div>

        {/* Name */}
        <Input
          label="Project Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={80}
        />

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-on-surface-variant">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief goals and scope for this project..."
            className="w-full text-xs rounded-lg p-2.5 bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Icon picker */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-on-surface-variant">Icon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map(em => (
              <button
                key={em}
                type="button"
                onClick={() => setIcon(em)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                  icon === em
                    ? 'bg-primary/25 border-2 border-primary scale-105'
                    : 'bg-surface-container border border-outline-variant hover:bg-surface-container-high'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-on-surface-variant">Theme Color</label>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{
                  background: c,
                  boxShadow: color === c ? `0 0 0 3px var(--color-background), 0 0 0 5px ${c}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Danger zone delete */}
        <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs px-3 py-1.5 rounded-lg text-error hover:bg-error-container/20 transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            <span>{deleting ? 'Deleting...' : 'Delete Project'}</span>
          </button>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
