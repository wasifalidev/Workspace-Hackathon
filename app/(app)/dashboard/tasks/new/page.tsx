'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch, useAppSelector } from '@/store'
import { addTask, TaskStatus, TaskPriority } from '@/store/slices/taskSlice'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'

export default function GlobalNewTaskPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const projects = useAppSelector(s => s.project.projects)
  const currentWorkspace = useAppSelector(s => s.workspace.currentWorkspace)
  const user = useAppSelector(s => s.auth.user)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [estimatePoints, setEstimatePoints] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Task title is required')
      return
    }

    if (!projectId && projects.length === 0) {
      toast.error('Please create a project first')
      router.push('/workspaces/new-project')
      return
    }

    const finalProjectId = projectId || projects[0]?.id

    setLoading(true)
    const newId = crypto.randomUUID()
    const now = new Date().toISOString()

    const taskData = {
      id: newId,
      projectId: finalProjectId,
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      assigneeId: user?.id || null,
      dueDate: dueDate || null,
      startDate: null,
      estimatePoints: estimatePoints === '' ? null : estimatePoints,
      sortOrder: Date.now(),
      createdBy: user?.id || null,
      createdAt: now,
      updatedAt: now,
      assignee: user ? { id: user.id, fullName: user.fullName, avatarUrl: user.avatarUrl } : undefined,
    }

    try {
      const supabase = createClient()
      await supabase.from('tasks').insert({
        id: newId,
        project_id: finalProjectId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assignee_id: taskData.assigneeId,
        due_date: taskData.dueDate,
        estimate_points: taskData.estimatePoints,
        created_by: taskData.createdBy,
      })

      dispatch(addTask(taskData))
      toast.success('Task created!')
      const wSlug = currentWorkspace?.slug || '_'
      router.push(`/${wSlug}/${finalProjectId}/board`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task')
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
        <span className="text-on-surface font-semibold">New Task</span>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6 pb-4 border-b border-outline-variant">
          <h1 className="text-xl font-bold text-on-surface font-headline-md">Create New Task</h1>
          <p className="text-xs text-on-surface-variant mt-0.5 font-body-sm">
            Add an issue, bug, or feature to track across your team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {projects.length > 0 ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant">
                Target Project
              </label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full text-xs rounded-lg p-2.5 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-surface-container rounded-lg text-xs text-on-surface-variant flex items-center justify-between">
              <span>No project found in this workspace yet.</span>
              <Link href="/workspaces/new-project" className="text-primary hover:underline font-medium">
                + Create Project
              </Link>
            </div>
          )}

          <Input
            label="Task Title"
            placeholder="e.g. Implement offline database migrations"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-on-surface-variant">
              Description & Specifications
            </label>
            <textarea
              rows={4}
              placeholder="What needs to be done?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-lg text-xs p-3 bg-surface-container border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant">
                Initial Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs rounded-lg p-2.5 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs rounded-lg p-2.5 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="urgent">Urgent (P1)</option>
                <option value="high">High (P2)</option>
                <option value="medium">Medium (P3)</option>
                <option value="low">Low (P4)</option>
                <option value="no_priority">None</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-xs rounded-lg p-2.5 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface-variant">
                Estimate (Story Points)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                placeholder="e.g. 3"
                value={estimatePoints}
                onChange={e =>
                  setEstimatePoints(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                }
                className="w-full text-xs rounded-lg p-2.5 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} icon="add">
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
