'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch, useAppSelector } from '@/store'
import { setTasks, moveTask, Task, TaskStatus } from '@/store/slices/taskSlice'
import { setCurrentProject } from '@/store/slices/projectSlice'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { NewTaskModal } from '@/components/tasks/NewTaskModal'
import { Avatar } from '@/components/ui/Avatar'
import { toast } from 'sonner'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'bg-outline' },
  { id: 'todo', label: 'To Do', color: 'bg-primary' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-tertiary' },
  { id: 'in_review', label: 'In Review', color: 'bg-secondary' },
  { id: 'done', label: 'Done', color: 'bg-emerald-400' },
]

export default function KanbanBoardPage({
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
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [targetColumnStatus, setTargetColumnStatus] = useState<TaskStatus>('todo')
  const [projectData, setProjectData] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<{ id: string; full_name: string | null; avatar_url: string | null }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch project details, tasks, and real members
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const supabase = createClient()

      // Fetch project
      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (proj) {
        setProjectData(proj)
        dispatch(setCurrentProject(proj))
      }

      // Fetch tasks for this project
      const { data: taskData } = await supabase
        .from('tasks')
        .select(`
          id, project_id, title, description, status, priority,
          assignee_id, due_date, start_date, estimate_points, sort_order,
          created_by, created_at, updated_at,
          assignee:profiles(id, full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true })

      if (taskData && taskData.length > 0) {
        const formattedTasks: Task[] = taskData.map((t: any) => ({
          id: t.id,
          projectId: t.project_id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assignee_id,
          dueDate: t.due_date,
          startDate: t.start_date,
          estimatePoints: t.estimate_points,
          sortOrder: t.sort_order,
          createdBy: t.created_by,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          assignee: t.assignee
            ? {
                id: t.assignee.id,
                fullName: t.assignee.full_name,
                avatarUrl: t.assignee.avatar_url,
              }
            : undefined,
        }))
        dispatch(setTasks(formattedTasks))
      } else {
        dispatch(setTasks([]))
      }

      // Fetch workspace members for real team avatar stack
      const { data: members } = await supabase
        .from('workspace_members')
        .select('id, profiles(id, full_name, avatar_url)')
        .limit(6)
      if (members) {
        const validProfiles = members
          .map((m: any) => m.profiles)
          .filter(Boolean)
        setTeamMembers(validProfiles)
      }

      setIsLoading(false)
    }

    loadData()
  }, [projectId, dispatch])

  // Drag and drop / move handler
  function handleMoveToColumn(taskId: string, newStatus: TaskStatus) {
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    dispatch(moveTask({ taskId, newStatus, newSortOrder: Date.now() }))

    const supabase = createClient()
    supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .then(({ error }) => {
        if (error) console.warn('Status sync notice:', error.message)
      })

    toast.success(`Task moved to ${newStatus.replace('_', ' ')}`)
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (t.projectId && t.projectId !== projectId) return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
    return true
  })

  const projectName = projectData?.name || currentProject?.name || 'Project'

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* ── Sub-header project banner ── */}
      <div className="px-6 sm:px-8 pt-6 pb-2 bg-surface-container-lowest border-b border-outline-variant/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2 font-headline-lg tracking-tight">
                <span className="text-tertiary">{projectData?.icon || '⚡'}</span>
                <span>{projectName}</span>
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-xs font-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span>Active</span>
              </div>
              <span className="font-code-metric text-[11px] text-outline px-2 py-0.5 rounded bg-surface-container-high">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5 max-w-2xl truncate font-body-sm">
              {projectData?.description || 'Manage tasks, track progress, and collaborate in real-time.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Team stack */}
            <div className="flex items-center -space-x-2">
              {teamMembers.length > 0 ? (
                teamMembers.slice(0, 4).map((m, idx) => (
                  <Avatar key={m.id || idx} src={m.avatar_url} name={m.full_name || 'Member'} size="sm" />
                ))
              ) : (
                <Avatar name="You" size="sm" />
              )}
              {teamMembers.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-semibold flex items-center justify-center ring-1 ring-surface">
                  +{teamMembers.length - 4}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Project link copied to clipboard')
              }}
              type="button"
              className="h-8 px-3 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors text-xs font-medium flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>Share</span>
            </button>

            <button
              onClick={() => {
                setTargetColumnStatus('todo')
                setIsNewTaskOpen(true)
              }}
              type="button"
              className="h-8 px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-dim transition-colors text-xs font-medium flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-5 flex items-center justify-between">
          <nav className="flex items-center gap-6 -mb-px">
            <Link
              href={`/${workspaceSlug}/${projectId}/board`}
              className="flex items-center gap-1.5 py-2 text-xs font-semibold text-primary relative"
            >
              <span className="material-symbols-outlined text-[18px]">view_kanban</span>
              <span>Board</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            </Link>
            <Link
              href={`/${workspaceSlug}/${projectId}/list`}
              className="flex items-center gap-1.5 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              <span>List / Table</span>
            </Link>
            <Link
              href={`/${workspaceSlug}/${projectId}/calendar`}
              className="flex items-center gap-1.5 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Calendar</span>
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-1.5 text-on-surface-variant text-xs font-label-sm">
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span>Display: Compact Cards</span>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="px-6 sm:px-8 py-2.5 bg-surface-container-low border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search input */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-7 w-48 pl-8 pr-2.5 bg-surface text-on-surface placeholder:text-outline text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-primary transition-colors border border-outline-variant/40"
            />
          </div>

          <div className="h-4 w-px bg-outline-variant/60 mx-1" />

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="h-7 px-2.5 rounded-lg bg-surface text-on-surface-variant hover:text-on-surface text-xs font-label-sm border border-outline-variant/40 focus:outline-none cursor-pointer"
          >
            <option value="all">Priority: All</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {(searchQuery || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setPriorityFilter('all')
              }}
              type="button"
              className="h-7 px-2 rounded text-outline hover:text-on-surface text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-surface rounded text-on-surface-variant text-xs font-label-sm border border-outline-variant/40">
            <span className="text-outline">Group by:</span>
            <span className="font-semibold text-on-surface">Status</span>
          </div>
        </div>
      </div>

      {/* ── Kanban Board Lanes ── */}
      <div className="flex-1 overflow-x-auto p-3 sm:p-6 md:p-8 bg-surface">
        <div className="inline-flex items-start gap-3 sm:gap-4 min-w-full pb-12">
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id)

            return (
              <div
                key={col.id}
                className="w-[285px] sm:w-80 shrink-0 flex flex-col rounded-xl bg-surface-container-low p-3 shadow-sm border border-outline-variant/40"
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-1 py-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <h2 className="text-xs font-semibold text-on-surface font-headline-sm uppercase tracking-wider">
                      {col.label}
                    </h2>
                    <span className="font-code-metric text-[11px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <button
                      onClick={() => {
                        setTargetColumnStatus(col.id)
                        setIsNewTaskOpen(true)
                      }}
                      type="button"
                      className="p-1 rounded hover:bg-surface-container hover:text-on-surface transition-colors"
                      title="Add task to column"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>

                {/* Cards container */}
                <div className="flex flex-col gap-2.5 flex-1 min-h-[400px]">
                  {colTasks.map(task => (
                    <div key={task.id} className="relative">
                      <TaskCard
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        onStatusChange={newStatus => handleMoveToColumn(task.id, newStatus)}
                      />

                      {/* Move to next/prev column buttons on hover */}
                      <div className="hidden group-hover:flex absolute top-2 right-2 items-center gap-1 bg-surface-container-highest rounded px-1 py-0.5">
                        {col.id !== 'backlog' && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              const prevIdx = COLUMNS.findIndex(c => c.id === col.id) - 1
                              handleMoveToColumn(task.id, COLUMNS[prevIdx].id)
                            }}
                            title="Move left"
                            className="p-0.5 hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-[12px]">chevron_left</span>
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              const nextIdx = COLUMNS.findIndex(c => c.id === col.id) + 1
                              handleMoveToColumn(task.id, COLUMNS[nextIdx].id)
                            }}
                            title="Move right"
                            className="p-0.5 hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-lg p-6 text-center">
                      <p className="text-xs text-outline italic">No tasks in {col.label}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Add Task button */}
                <button
                  onClick={() => {
                    setTargetColumnStatus(col.id)
                    setIsNewTaskOpen(true)
                  }}
                  type="button"
                  className="mt-3 py-2 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-medium flex items-center gap-1.5 transition-colors border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>New task</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        workspaceSlug={workspaceSlug}
        projectName={projectName}
      />

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        defaultStatus={targetColumnStatus}
        projectId={projectId}
      />
    </div>
  )
}
