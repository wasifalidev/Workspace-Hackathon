'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch, useAppSelector } from '@/store'
import { updateWorkspace, removeWorkspace } from '@/store/slices/workspaceSlice'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = use(params)
  const { slug } = resolvedParams
  const router = useRouter()
  const dispatch = useAppDispatch()

  const currentWorkspace = useAppSelector(s => s.workspace.currentWorkspace)
  const [name, setName] = useState(currentWorkspace?.name || '')
  const [color, setColor] = useState(currentWorkspace?.color || '#c0c1ff')
  const [description, setDescription] = useState(currentWorkspace?.description || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name)
      setColor(currentWorkspace.color || '#c0c1ff')
      setDescription(currentWorkspace.description || '')
    }
  }, [currentWorkspace])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    try {
      const supabase = createClient()
      if (currentWorkspace) {
        await supabase
          .from('workspaces')
          .update({
            name: name.trim(),
            color,
            description: description.trim() || null,
          })
          .eq('id', currentWorkspace.id)

        dispatch(
          updateWorkspace({
            id: currentWorkspace.id,
            name: name.trim(),
            color,
            description: description.trim() || null,
          })
        )
      }
      toast.success('Workspace updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update workspace')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteWorkspace() {
    if (!currentWorkspace) return
    const confirmed = prompt(`Type "${currentWorkspace.slug}" to permanently delete this workspace:`)
    if (confirmed !== currentWorkspace.slug) {
      if (confirmed !== null) toast.error('Workspace slug did not match. Deletion cancelled.')
      return
    }

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('workspaces').delete().eq('id', currentWorkspace.id)
      if (error) throw error

      dispatch(removeWorkspace(currentWorkspace.id))
      toast.success('Workspace deleted successfully')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete workspace')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label-md">
        <Link href="/workspaces" className="hover:text-on-surface transition-colors">
          Workspaces
        </Link>
        <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
        <span className="text-on-surface font-semibold">{currentWorkspace?.name || slug}</span>
        <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
        <span className="text-on-surface">Settings</span>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline-lg">Workspace Settings</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            General configuration and team settings for this workspace.
          </p>
        </div>
        <Link
          href={`/workspaces/${slug}/members`}
          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">group</span>
          <span>Manage Members</span>
        </Link>
      </div>

      <form onSubmit={handleSave} className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-sm space-y-5">
        <Input
          label="Workspace Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-on-surface-variant">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full text-xs rounded-lg p-2.5 bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary resize-y"
          />
        </div>

        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-error">
          <span className="material-symbols-outlined text-xl">warning</span>
          <h2 className="text-base font-bold">Danger Zone</h2>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Deleting a workspace is permanent. It will permanently remove all associated projects, tasks, comments, and member allocations.
        </p>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={deleting}
            onClick={handleDeleteWorkspace}
            className="px-4 py-2 rounded-lg bg-error text-surface-container-lowest font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">delete_forever</span>
            <span>{deleting ? 'Deleting...' : 'Delete Workspace'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
