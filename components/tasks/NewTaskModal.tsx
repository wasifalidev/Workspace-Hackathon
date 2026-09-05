'use client'

import React, { useState } from 'react'
import type { Task, TaskStatus, TaskPriority } from '@/store/slices/taskSlice'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch, useAppSelector } from '@/store'
import { addTask } from '@/store/slices/taskSlice'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  defaultStatus?: TaskStatus
  projectId?: string
}

export function NewTaskModal({
  isOpen,
  onClose,
  defaultStatus = 'todo',
  projectId,
}: NewTaskModalProps) {
  const dispatch = useAppDispatch()
  const projects = useAppSelector(s => s.project.projects)
  const currentProject = useAppSelector(s => s.project.currentProject)
  const user = useAppSelector(s => s.auth.user)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projectId || currentProject?.id || (projects[0]?.id ?? '')
  )
  const [dueDate, setDueDate] = useState('')
  const [estimatePoints, setEstimatePoints] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const pId = selectedProjectId || currentProject?.id || projects[0]?.id
    if (!pId) {
      toast.error('Please select or create a project first')
      return
    }

    setLoading(true)
    const newTaskId = crypto.randomUUID()
    const now = new Date().toISOString()

    const newTaskObj: Task = {
      id: newTaskId,
      projectId: pId,
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
      const { error } = await supabase.from('tasks').insert({
        id: newTaskId,
        project_id: pId,
        title: newTaskObj.title,
        description: newTaskObj.description,
        status: newTaskObj.status,
        priority: newTaskObj.priority,
        assignee_id: newTaskObj.assigneeId,
        due_date: newTaskObj.dueDate,
        estimate_points: newTaskObj.estimatePoints,
        created_by: newTaskObj.createdBy,
      })

      if (error) {
        toast.error(error.message || 'Failed to save task in Supabase')
        setLoading(false)
        return
      }

      dispatch(addTask(newTaskObj))
      toast.success('Task created successfully')
      setTitle('')
      setDescription('')
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project selector if not pre-selected */}
        {!projectId && projects.length > 0 && (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-on-surface-variant">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full text-xs rounded-lg p-2 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.icon || '📁'} {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Task Title"
          placeholder="e.g. Implement real-time cursor sync"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-on-surface-variant">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Details, acceptance criteria..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full text-xs rounded-lg p-2.5 bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-on-surface-variant">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="w-full text-xs rounded-lg p-2 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-on-surface-variant">
              Priority
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="w-full text-xs rounded-lg p-2 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
              <option value="no_priority">⚪ No Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-on-surface-variant">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full text-xs rounded-lg p-2 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-on-surface-variant">
              Story Points
            </label>
            <input
              type="number"
              min="0"
              max="50"
              placeholder="e.g. 5"
              value={estimatePoints}
              onChange={e =>
                setEstimatePoints(e.target.value === '' ? '' : parseInt(e.target.value, 10))
              }
              className="w-full text-xs rounded-lg p-2 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon="add">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
