'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch, useAppSelector } from '@/store'
import { setTasks, updateTask, Task, TaskStatus } from '@/store/slices/taskSlice'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { NewTaskModal } from '@/components/tasks/NewTaskModal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { AppIcon } from '@/components/ui/AppIcon'
import { toast } from 'sonner'

export default function ProjectListViewPage({
  params,
}: {
  params: Promise<{ workspace: string; project: string }>
}) {
  const resolvedParams = use(params)
  const { workspace: workspaceSlug, project: projectId } = resolvedParams

  const dispatch = useAppDispatch()
  const tasks = useAppSelector(s => s.task.tasks)
  const currentProject = useAppSelector(s => s.project.currentProject)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      if (proj) setProjectData(proj)
    }
    load()
  }, [projectId])

  async function handleToggleStatus(task: Task) {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
    dispatch(updateTask({ id: task.id, status: nextStatus }))

    const supabase = createClient()
    await supabase.from('tasks').update({ status: nextStatus }).eq('id', task.id)
    toast.success(`Task marked as ${nextStatus}`)
  }

  const filteredTasks = tasks.filter(t => {
    if (t.projectId && t.projectId !== projectId) return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const projectName = projectData?.name || currentProject?.name || 'Project'

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Sub-header banner */}
      <div className="px-6 sm:px-8 pt-6 pb-2 bg-surface-container-lowest border-b border-outline-variant/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2 font-headline-lg">
              <AppIcon name={projectData?.icon || 'bolt'} size={24} color={projectData?.color || 'var(--color-tertiary)'} />
              <span>{projectName}</span>
            </h1>
            <p className="text-xs text-on-surface-variant mt-1 font-body-sm">
              Table and list view of all issues, tasks, and stories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewTaskOpen(true)}
              type="button"
              className="h-8 px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-dim transition-colors text-xs font-medium flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex items-center gap-6 -mb-px">
          <Link
            href={`/${workspaceSlug}/${projectId}/board`}
            className="flex items-center gap-1.5 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">view_kanban</span>
            <span>Board</span>
          </Link>
          <Link
            href={`/${workspaceSlug}/${projectId}/list`}
            className="flex items-center gap-1.5 py-2 text-xs font-semibold text-primary relative"
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            <span>List / Table</span>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          </Link>
          <Link
            href={`/${workspaceSlug}/${projectId}/calendar`}
            className="flex items-center gap-1.5 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Calendar</span>
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="px-6 sm:px-8 py-2.5 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between gap-3">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-[16px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search list..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-7 w-56 pl-8 pr-2.5 bg-surface text-on-surface placeholder:text-outline text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40"
          />
        </div>
        <div className="text-xs text-outline font-code-metric">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      {/* Table view */}
      <div className="flex-1 p-6 sm:p-8 overflow-x-auto">
        <div className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/60 bg-surface-container-lowest/60 text-[11px] font-semibold text-outline uppercase tracking-wider font-label-sm">
                <th className="py-3 px-4 w-10">Done</th>
                <th className="py-3 px-4 w-24">Key</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-28">Priority</th>
                <th className="py-3 px-4 w-32">Due Date</th>
                <th className="py-3 px-4 w-36">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-xs">
              {filteredTasks.map(task => {
                const isDone = task.status === 'done'
                const taskKey = `WM-${task.id.slice(0, 4).toUpperCase()}`

                return (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3 px-4"
                      onClick={e => {
                        e.stopPropagation()
                        handleToggleStatus(task)
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        readOnly
                        className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                      />
                    </td>

                    {/* Key */}
                    <td className="py-3 px-4 font-code-metric text-primary font-semibold">
                      {taskKey}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 font-medium text-on-surface">
                      <span className={isDone ? 'line-through text-outline' : ''}>
                        {task.title}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          task.status === 'done'
                            ? 'secondary'
                            : task.status === 'in_progress'
                            ? 'tertiary'
                            : 'surface'
                        }
                        dot
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-label-sm font-semibold capitalize ${
                          task.priority === 'urgent' || task.priority === 'high'
                            ? 'text-error'
                            : task.priority === 'medium'
                            ? 'text-tertiary'
                            : 'text-outline'
                        }`}
                      >
                        {task.priority.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 font-code-metric text-on-surface-variant">
                      {task.dueDate ? (
                        new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      ) : (
                        <span className="text-outline italic">—</span>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={task.assignee?.avatarUrl}
                          name={task.assignee?.fullName || 'Unassigned'}
                          size="xs"
                        />
                        <span className="truncate text-on-surface-variant">
                          {task.assignee?.fullName || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-outline italic">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        workspaceSlug={workspaceSlug}
        projectName={projectName}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        projectId={projectId}
      />
    </div>
  )
}
