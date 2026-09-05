'use client'

import React, { useState, useEffect } from 'react'
import type { Task, TaskStatus, TaskPriority } from '@/store/slices/taskSlice'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch, useAppSelector } from '@/store'
import { updateTask, removeTask } from '@/store/slices/taskSlice'
import { Avatar } from '@/components/ui/Avatar'
import { toast } from 'sonner'

interface Subtask {
  id: string
  title: string
  is_completed: boolean
}

interface Comment {
  id: string
  content: string
  created_at: string
  user?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  workspaceSlug?: string
  projectName?: string
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  workspaceSlug = 'workspace',
  projectName = 'Project',
}: TaskDetailModalProps) {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(s => s.auth.user)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [estimatePoints, setEstimatePoints] = useState<number | ''>('')
  const [dueDate, setDueDate] = useState<string>('')

  // Subtasks & Comments
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // Initialize form state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setStatus(task.status)
      setPriority(task.priority)
      setEstimatePoints(task.estimatePoints ?? '')
      setDueDate(task.dueDate || '')
      fetchTaskRelations(task.id)
    }
  }, [task])

  // Escape key closes modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  async function fetchTaskRelations(taskId: string) {
    const supabase = createClient()

    // Fetch subtasks
    const { data: subData } = await supabase
      .from('subtasks')
      .select('id, title, is_completed')
      .eq('task_id', taskId)
      .order('sort_order', { ascending: true })
    if (subData) setSubtasks(subData)

    // Fetch comments
    const { data: commData } = await supabase
      .from('comments')
      .select('id, content, created_at, user:profiles(id, full_name, avatar_url)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    if (commData) setComments(commData as any)
  }

  if (!isOpen || !task) return null

  const taskCode = `WM-${task.id.slice(0, 4).toUpperCase()}`

  async function saveField(fields: Partial<Task>) {
    if (!task) return
    dispatch(updateTask({ id: task.id, ...fields }))

    const supabase = createClient()
    const dbPayload: Record<string, any> = {}
    if ('title' in fields) dbPayload.title = fields.title
    if ('description' in fields) dbPayload.description = fields.description
    if ('status' in fields) dbPayload.status = fields.status
    if ('priority' in fields) dbPayload.priority = fields.priority
    if ('dueDate' in fields) dbPayload.due_date = fields.dueDate || null
    if ('estimatePoints' in fields) dbPayload.estimate_points = fields.estimatePoints || null

    const { error } = await supabase
      .from('tasks')
      .update(dbPayload)
      .eq('id', task.id)

    if (error) {
      toast.error('Failed to sync changes')
    }
  }

  async function toggleSubtask(subId: string, current: boolean) {
    const updated = subtasks.map(s => (s.id === subId ? { ...s, is_completed: !current } : s))
    setSubtasks(updated)

    const supabase = createClient()
    await supabase.from('subtasks').update({ is_completed: !current }).eq('id', subId)
  }

  async function handleAddSubtask(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubtaskTitle.trim() || !task) return

    const newSub: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtaskTitle.trim(),
      is_completed: false,
    }
    setSubtasks([...subtasks, newSub])
    setNewSubtaskTitle('')

    const supabase = createClient()
    await supabase.from('subtasks').insert({
      id: newSub.id,
      task_id: task.id,
      title: newSub.title,
      is_completed: false,
    })
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || !task) return

    setSubmittingComment(true)
    const newComm: Comment = {
      id: crypto.randomUUID(),
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      user: {
        id: currentUser?.id || '',
        full_name: currentUser?.fullName || 'Current User',
        avatar_url: currentUser?.avatarUrl || null,
      },
    }

    setComments([...comments, newComm])
    setNewComment('')

    try {
      const supabase = createClient()
      await supabase.from('comments').insert({
        id: newComm.id,
        task_id: task.id,
        user_id: currentUser?.id,
        content: newComm.content,
      })
    } catch {
      // offline fallback
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleDeleteTask() {
    if (!task) return
    if (!confirm('Are you sure you want to delete this task?')) return
    dispatch(removeTask(task.id))
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', task.id)
    toast.success('Task deleted')
    onClose()
  }

  const completedSubtasksCount = subtasks.filter(s => s.is_completed).length

  return (
    <div className="modal-backdrop flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Container matching Stitch modal (max-w-6xl, h-[92vh]) */}
      <div className="relative flex flex-col w-full max-w-6xl h-[92vh] max-h-[920px] bg-surface-container-low rounded-xl border border-outline-variant shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="h-14 px-5 flex items-center justify-between shrink-0 bg-surface-container-lowest/90 backdrop-blur-sm border-b border-outline-variant">
          {/* Left: Breadcrumbs & quick selectors */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-label-md truncate">
              <span className="truncate">{workspaceSlug}</span>
              <span className="text-outline">/</span>
              <span className="truncate">{projectName}</span>
              <span className="text-outline">/</span>
              <span className="font-code-metric text-primary font-semibold">{taskCode}</span>
            </div>

            <div className="h-4 w-px bg-surface-container-highest hidden sm:block" />

            {/* Status Selector */}
            <select
              value={status}
              onChange={e => {
                const s = e.target.value as TaskStatus
                setStatus(s)
                saveField({ status: s })
              }}
              className="text-xs font-semibold rounded-full px-2.5 py-1 bg-primary/15 text-primary border border-primary/20 focus:outline-none cursor-pointer"
            >
              <option value="backlog" className="bg-surface-container text-on-surface">Backlog</option>
              <option value="todo" className="bg-surface-container text-on-surface">To Do</option>
              <option value="in_progress" className="bg-surface-container text-on-surface">In Progress</option>
              <option value="in_review" className="bg-surface-container text-on-surface">In Review</option>
              <option value="done" className="bg-surface-container text-on-surface">Done</option>
            </select>

            {/* Priority Selector */}
            <select
              value={priority}
              onChange={e => {
                const p = e.target.value as TaskPriority
                setPriority(p)
                saveField({ priority: p })
              }}
              className="hidden sm:block text-xs font-semibold rounded-full px-2.5 py-1 bg-surface-container-high text-on-surface border border-outline-variant focus:outline-none cursor-pointer"
            >
              <option value="urgent" className="bg-surface-container text-error">Urgent</option>
              <option value="high" className="bg-surface-container text-error">High</option>
              <option value="medium" className="bg-surface-container text-tertiary">Medium</option>
              <option value="low" className="bg-surface-container text-on-surface-variant">Low</option>
              <option value="no_priority" className="bg-surface-container text-outline">No Priority</option>
            </select>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(taskCode)
                toast.success(`Copied ${taskCode} to clipboard`)
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Copy ID</span>
            </button>
            <button
              onClick={handleDeleteTask}
              className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-colors"
              title="Delete task"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Close modal (Esc)"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Split View Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Content Column (65% width) */}
          <div className="flex-1 lg:w-[65%] overflow-y-auto p-5 sm:p-7 space-y-6 bg-surface-container-low">
            
            {/* Editable Title */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-secondary text-xs font-code-metric">
                <span className="material-symbols-outlined text-[15px]">alt_route</span>
                <span>feature/{taskCode.toLowerCase()}-sync</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => saveField({ title })}
                className="w-full text-xl sm:text-2xl font-bold text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none transition-colors py-1"
                placeholder="Task title..."
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Description & Specifications
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                onBlur={() => saveField({ description })}
                placeholder="Add a detailed description, user story, or acceptance criteria..."
                className="w-full text-sm rounded-lg p-3 bg-surface-container border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-y"
              />
            </div>

            {/* Subtasks Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Subtasks
                  </span>
                  <span className="font-code-metric text-[11px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                    {completedSubtasksCount}/{subtasks.length}
                  </span>
                </div>
                {subtasks.length > 0 && (
                  <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary transition-all"
                      style={{
                        width: `${(completedSubtasksCount / subtasks.length) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Subtask list */}
              <div className="space-y-1.5">
                {subtasks.map(st => (
                  <div
                    key={st.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container border border-outline-variant/40 hover:border-outline-variant transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={st.is_completed}
                      onChange={() => toggleSubtask(st.id, st.is_completed)}
                      className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    />
                    <span
                      className={`text-sm flex-1 ${
                        st.is_completed
                          ? 'line-through text-outline'
                          : 'text-on-surface'
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 text-xs rounded-lg px-3 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-medium disabled:opacity-40 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Comments & Activity Feed */}
            <div className="space-y-3 pt-4 border-t border-outline-variant">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Discussion & Activity
              </span>

              {/* Comments list */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-outline italic py-2">
                    No comments yet. Start the conversation below.
                  </p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-surface-container">
                      <Avatar
                        src={c.user?.avatar_url}
                        name={c.user?.full_name || 'User'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-on-surface">
                            {c.user?.full_name || 'Team Member'}
                          </span>
                          <span className="text-[10px] text-outline font-code-metric">
                            {new Date(c.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* New comment textarea */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <textarea
                  rows={2}
                  placeholder="Write a comment or update... Use @ to mention team members"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="flex-1 text-xs rounded-lg p-2.5 bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="px-4 rounded-lg bg-primary text-on-primary font-medium text-xs self-end py-2 hover:bg-primary-fixed-dim transition-colors disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Right Metadata Column (35% width) */}
          <div className="lg:w-[35%] border-t lg:border-t-0 lg:border-l border-outline-variant bg-surface-container-lowest/50 p-5 sm:p-6 space-y-5 overflow-y-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Task Details
            </h3>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-outline">Assignee</label>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container border border-outline-variant/40">
                <Avatar
                  src={task.assignee?.avatarUrl}
                  name={task.assignee?.fullName || 'Unassigned'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-on-surface truncate">
                    {task.assignee?.fullName || 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-outline">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => {
                  setDueDate(e.target.value)
                  saveField({ dueDate: e.target.value })
                }}
                className="w-full text-xs rounded-lg p-2 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              />
            </div>

            {/* Story Points */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-outline">Estimate (Story Points)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 3"
                value={estimatePoints}
                onChange={e => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value, 10)
                  setEstimatePoints(val)
                  saveField({ estimatePoints: val === '' ? null : val })
                }}
                className="w-full text-xs rounded-lg p-2 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Labels */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-outline">Labels</label>
              <div className="flex flex-wrap gap-1.5">
                {task.labels && task.labels.length > 0 ? (
                  task.labels.map(l => (
                    <span
                      key={l.id}
                      className="px-2 py-0.5 rounded text-[11px] font-medium"
                      style={{
                        background: `${l.color}20`,
                        color: l.color,
                        border: `1px solid ${l.color}40`,
                      }}
                    >
                      {l.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-outline italic">No labels attached</span>
                )}
              </div>
            </div>

            {/* Presence & Sync status */}
            <div className="pt-4 border-t border-outline-variant/60 space-y-2">
              <div className="flex items-center gap-2 text-xs text-secondary font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Real-time presence active</span>
              </div>
              <div className="text-[10px] text-outline font-code-metric">
                Created on {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
