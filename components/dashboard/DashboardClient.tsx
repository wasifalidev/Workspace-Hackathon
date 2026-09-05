'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppDispatch } from '@/store'
import { setCurrentWorkspace, Workspace } from '@/store/slices/workspaceSlice'
import { toast } from 'sonner'
import { format } from 'date-fns'

export interface DashboardTask {
  id: string
  title: string
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'no_priority'
  dueDate: string | null
  estimatePoints: number | null
  projectId: string
  projectName: string
  projectColor: string | null
  projectIcon: string | null
  workspaceId: string
  workspaceSlug: string
  workspaceName: string
}

export interface DashboardProject {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  workspaceId: string
  workspaceSlug: string
  workspaceName: string
  createdAt: string
  taskCount?: number
  completedCount?: number
}

interface DashboardClientProps {
  initialWorkspaces: Workspace[]
  initialProjects: DashboardProject[]
  initialTasks: DashboardTask[]
  recentActivity: any[]
  userName: string
}

export default function DashboardClient({
  initialWorkspaces,
  initialProjects,
  initialTasks,
  recentActivity,
  userName,
}: DashboardClientProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [tasks, setTasks] = useState<DashboardTask[]>(initialTasks)
  const [taskFilter, setTaskFilter] = useState<'all' | 'urgent' | 'done'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 1-Click Task Ticking
  async function handleToggleTask(taskId: string, currentStatus: string) {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done'

    // Optimistic update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: nextStatus as any } : t))
    )

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', taskId)

      if (error) {
        toast.error('Failed to update task in Supabase')
        // Revert on error
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, status: currentStatus as any } : t))
        )
      } else {
        if (nextStatus === 'done') {
          toast.success('Task marked as completed! 🎉')
        } else {
          toast.info('Task restored to To-Do')
        }
      }
    } catch {
      toast.error('Network error updating task')
    }
  }

  // Quick switch workspace
  function handleSelectWorkspace(ws: Workspace) {
    dispatch(setCurrentWorkspace(ws))
    router.push(`/${ws.slug}/projects`)
  }

  // Dynamic Metrics Calculations
  const totalWorkspaces = initialWorkspaces.length
  const totalProjects = initialProjects.length
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done')
  const doneCount = doneTasks.length
  const activeCount = totalTasks - doneCount

  const inReviewCount = tasks.filter(t => t.status === 'in_review').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const todoCount = tasks.filter(t => t.status === 'todo').length
  const backlogCount = tasks.filter(t => t.status === 'backlog').length

  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0

  // Filtered Tasks for Task Execution Hub
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'urgent') return t.priority === 'urgent' || t.priority === 'high'
    if (taskFilter === 'done') return t.status === 'done'
    if (taskFilter === 'all') return t.status !== 'done'
    return true
  }).filter(t => {
    if (!searchQuery) return true
    return t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.workspaceName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // SVG Donut Chart Calculation
  const radius = 42
  const circumference = 2 * Math.PI * radius // ≈ 263.89
  const getSliceDash = (count: number) => {
    if (totalTasks === 0) return '0 264'
    const length = (count / totalTasks) * circumference
    return `${length} ${circumference}`
  }

  const doneOffset = 0
  const inReviewOffset = -((doneCount / (totalTasks || 1)) * circumference)
  const inProgressOffset = inReviewOffset - ((inReviewCount / (totalTasks || 1)) * circumference)
  const todoOffset = inProgressOffset - ((inProgressCount / (totalTasks || 1)) * circumference)
  const backlogOffset = todoOffset - ((todoCount / (totalTasks || 1)) * circumference)

  return (
    <div className="flex flex-col w-full pb-16">
      {/* ── Context Top Banner ── */}
      <div
        className="px-6 sm:px-8 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b"
        style={{
          background: 'rgba(24,28,36,0.5)',
          borderColor: 'var(--color-outline-variant)',
        }}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-primary)' }}>
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Universal Command Hub
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface font-headline-lg">
              Welcome back, {userName || 'Creator'}
            </h1>
            <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(78,222,163,0.12)', color: 'var(--color-secondary)' }}>
              Full Universal Access
            </span>
          </div>
          <p className="text-xs sm:text-sm mt-1 text-on-surface-variant font-body-sm">
            Overview of all your workspaces, projects, velocity metrics, and interactive tasks.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/workspaces/new"
            className="h-9 px-3.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
            style={{
              background: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <span className="material-symbols-outlined text-base text-primary">add_business</span>
            <span>New Workspace</span>
          </Link>
          <Link
            href="/workspaces/new-project"
            className="h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
            }}
          >
            <span className="material-symbols-outlined text-base">create_new_folder</span>
            <span>New Project</span>
          </Link>
          <Link
            href="/dashboard/tasks/new"
            className="h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: 'var(--color-secondary)',
              color: 'var(--color-on-secondary)',
            }}
          >
            <span className="material-symbols-outlined text-base">add_task</span>
            <span>New Task</span>
          </Link>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
        {/* ── KPI Summary Cards Strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border space-y-2 bg-surface-container-low" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
              <span>Workspaces</span>
              <span className="material-symbols-outlined text-primary text-xl">domain</span>
            </div>
            <div className="text-3xl font-bold font-headline-lg text-on-surface">{totalWorkspaces}</div>
            <div className="text-[11px] text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">all_inclusive</span>
              <span>Unlimited &amp; Independent</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border space-y-2 bg-surface-container-low" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
              <span>Active Projects</span>
              <span className="material-symbols-outlined text-secondary text-xl">folder_managed</span>
            </div>
            <div className="text-3xl font-bold font-headline-lg text-on-surface">{totalProjects}</div>
            <div className="text-[11px] text-outline">Across all workspaces</div>
          </div>

          <div className="p-4 rounded-xl border space-y-2 bg-surface-container-low" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
              <span>Pending Tasks</span>
              <span className="material-symbols-outlined text-tertiary text-xl">pending_actions</span>
            </div>
            <div className="text-3xl font-bold font-headline-lg text-on-surface">{activeCount}</div>
            <div className="text-[11px] text-tertiary">To Do &amp; In Progress</div>
          </div>

          <div className="p-4 rounded-xl border space-y-2 bg-surface-container-low" style={{ borderColor: 'var(--color-outline-variant)' }}>
            <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
              <span>Completed</span>
              <span className="material-symbols-outlined text-secondary text-xl">task_alt</span>
            </div>
            <div className="text-3xl font-bold font-headline-lg text-secondary">{doneCount}</div>
            <div className="text-[11px] text-secondary font-medium">{completionRate}% total completion rate</div>
          </div>
        </div>

        {/* ── Beautiful Analytics Graphs Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Task Status Donut Graph */}
          <div
            className="p-5 rounded-xl border bg-surface-container-low flex flex-col justify-between"
            style={{ borderColor: 'var(--color-outline-variant)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-on-surface font-headline-sm">Task Status Distribution</h2>
                <p className="text-[11px] text-on-surface-variant">Overall progress across all projects</p>
              </div>
              <span className="material-symbols-outlined text-primary text-xl">donut_large</span>
            </div>

            {/* SVG Donut Visual */}
            <div className="flex items-center justify-center my-3 relative">
              <svg width="140" height="140" viewBox="0 0 110 110" className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="10"
                />
                {totalTasks > 0 ? (
                  <>
                    {/* Backlog */}
                    <circle
                      cx="55"
                      cy="55"
                      r={radius}
                      fill="transparent"
                      stroke="#908fa0"
                      strokeWidth="10"
                      strokeDasharray={getSliceDash(backlogCount)}
                      strokeDashoffset={backlogOffset}
                    />
                    {/* To Do */}
                    <circle
                      cx="55"
                      cy="55"
                      r={radius}
                      fill="transparent"
                      stroke="#c0c1ff"
                      strokeWidth="10"
                      strokeDasharray={getSliceDash(todoCount)}
                      strokeDashoffset={todoOffset}
                    />
                    {/* In Progress */}
                    <circle
                      cx="55"
                      cy="55"
                      r={radius}
                      fill="transparent"
                      stroke="#ffb95f"
                      strokeWidth="10"
                      strokeDasharray={getSliceDash(inProgressCount)}
                      strokeDashoffset={inProgressOffset}
                    />
                    {/* In Review */}
                    <circle
                      cx="55"
                      cy="55"
                      r={radius}
                      fill="transparent"
                      stroke="#6ffbbe"
                      strokeWidth="10"
                      strokeDasharray={getSliceDash(inReviewCount)}
                      strokeDashoffset={inReviewOffset}
                    />
                    {/* Done */}
                    <circle
                      cx="55"
                      cy="55"
                      r={radius}
                      fill="transparent"
                      stroke="#4edea3"
                      strokeWidth="10"
                      strokeDasharray={getSliceDash(doneCount)}
                      strokeDashoffset={doneOffset}
                    />
                  </>
                ) : (
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(192, 193, 255, 0.2)"
                    strokeWidth="10"
                  />
                )}
              </svg>

              {/* Center percentage badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-on-surface font-code-metric">{completionRate}%</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Done</span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-outline-variant/40">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
                <span className="text-on-surface-variant">Done:</span>
                <span className="font-semibold text-on-surface ml-auto">{doneCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary shrink-0" />
                <span className="text-on-surface-variant">In Progress:</span>
                <span className="font-semibold text-on-surface ml-auto">{inProgressCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#6ffbbe' }} />
                <span className="text-on-surface-variant">In Review:</span>
                <span className="font-semibold text-on-surface ml-auto">{inReviewCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                <span className="text-on-surface-variant">To Do:</span>
                <span className="font-semibold text-on-surface ml-auto">{todoCount}</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Workspaces Comparison & Task Distribution Bar Chart */}
          <div
            className="p-5 rounded-xl border bg-surface-container-low flex flex-col justify-between"
            style={{ borderColor: 'var(--color-outline-variant)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-on-surface font-headline-sm">Workspaces Velocity</h2>
                <p className="text-[11px] text-on-surface-variant">Completed vs total workload per workspace</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-xl">bar_chart</span>
            </div>

            <div className="space-y-3.5 my-auto py-2">
              {initialWorkspaces.map(ws => {
                const wsTasks = tasks.filter(t => t.workspaceId === ws.id)
                const wsDone = wsTasks.filter(t => t.status === 'done').length
                const wsTotal = wsTasks.length
                const wsRate = wsTotal > 0 ? Math.round((wsDone / wsTotal) * 100) : 0
                const wsProjects = initialProjects.filter(p => p.workspaceId === ws.id)

                return (
                  <div key={ws.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-medium truncate text-on-surface">
                        <span className="text-xs">{ws.icon || '🏢'}</span>
                        <span className="truncate">{ws.name}</span>
                        <span className="text-[10px] text-outline font-mono">({wsProjects.length} proj)</span>
                      </div>
                      <span className="text-xs font-semibold text-secondary">{wsDone}/{wsTotal} ({wsRate}%)</span>
                    </div>
                    {/* Dual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${wsRate}%`,
                          background: ws.color || 'var(--color-primary)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>{initialWorkspaces.length} Total Workspaces Active</span>
              <Link href="/workspaces" className="text-primary hover:underline font-medium">View All →</Link>
            </div>
          </div>

          {/* Chart 3: Activity & Velocity Trajectory Chart */}
          <div
            className="p-5 rounded-xl border bg-surface-container-low flex flex-col justify-between"
            style={{ borderColor: 'var(--color-outline-variant)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-on-surface font-headline-sm">Productivity Velocity</h2>
                <p className="text-[11px] text-on-surface-variant">Real-time completion wave</p>
              </div>
              <span className="material-symbols-outlined text-tertiary text-xl">trending_up</span>
            </div>

            {/* Glowing SVG Wave Area Chart */}
            <div className="my-auto py-2">
              <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4edea3" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4edea3" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8083ff" />
                    <stop offset="50%" stopColor="#4edea3" />
                    <stop offset="100%" stopColor="#6ffbbe" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <path
                  d="M 0,80 Q 50,45 100,60 T 200,30 T 300,15 L 300,100 L 0,100 Z"
                  fill="url(#areaGradient)"
                />
                {/* Line Path */}
                <path
                  d="M 0,80 Q 50,45 100,60 T 200,30 T 300,15"
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Data Points */}
                <circle cx="100" cy="60" r="4" fill="#8083ff" stroke="#0f131c" strokeWidth="2" />
                <circle cx="200" cy="30" r="4" fill="#4edea3" stroke="#0f131c" strokeWidth="2" />
                <circle cx="300" cy="15" r="5" fill="#6ffbbe" stroke="#0f131c" strokeWidth="2" />
              </svg>
              <div className="flex items-center justify-between text-[10px] text-outline font-code-metric mt-2">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Today</span>
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-[11px]">
              <span className="text-secondary flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-xs">bolt</span>
                Supabase Realtime Live Sync
              </span>
              <span className="text-on-surface-variant font-code-metric">{totalTasks} tasks tracked</span>
            </div>
          </div>
        </div>

        {/* ── Multi-Workspaces & Projects Explorer Directory ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-on-surface font-headline-md">Your Workspaces &amp; Projects</h2>
              <p className="text-xs text-on-surface-variant">Switch to any workspace, browse projects, or jump straight to Kanban boards</p>
            </div>
            <Link
              href="/workspaces/new"
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Add Workspace</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialWorkspaces.map(ws => {
              const wsProjects = initialProjects.filter(p => p.workspaceId === ws.id)
              const wsTasks = tasks.filter(t => t.workspaceId === ws.id)
              const wsDone = wsTasks.filter(t => t.status === 'done').length
              const wsRate = wsTasks.length > 0 ? Math.round((wsDone / wsTasks.length) * 100) : 0

              return (
                <div
                  key={ws.id}
                  className="rounded-xl border bg-surface-container-low p-5 space-y-4 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between"
                  style={{ borderColor: 'var(--color-outline-variant)' }}
                >
                  {/* Workspace Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 font-bold shadow-sm"
                          style={{ background: ws.color || 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                        >
                          {ws.icon || ws.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-on-surface truncate">{ws.name}</h3>
                          <div className="text-xs text-outline font-mono">/{ws.slug}</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/workspaces/new-project`}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex items-center gap-1"
                          title="Create Project in this Workspace"
                        >
                          <span className="material-symbols-outlined text-sm text-primary">add</span>
                          <span>Project</span>
                        </Link>
                        <button
                          onClick={() => handleSelectWorkspace(ws)}
                          type="button"
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:bg-primary-fixed-dim transition-colors flex items-center gap-1"
                        >
                          <span>Open</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      </div>
                    </div>

                    {ws.description && (
                      <p className="text-xs text-on-surface-variant line-clamp-1 mb-3">{ws.description}</p>
                    )}

                    {/* Progress strip */}
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-1">
                      <span>{wsProjects.length} Projects &bull; {wsTasks.length} Tasks</span>
                      <span className="font-semibold text-secondary">{wsRate}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className="h-full rounded-full bg-secondary transition-all"
                        style={{ width: `${wsRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Projects List inside Workspace */}
                  <div className="pt-3 border-t border-outline-variant/40 space-y-2">
                    <div className="text-[11px] font-semibold text-outline uppercase tracking-wider">
                      Projects ({wsProjects.length})
                    </div>

                    {wsProjects.length === 0 ? (
                      <div className="py-4 text-center rounded-lg border border-dashed border-outline-variant/60 bg-surface-container-lowest/40">
                        <p className="text-xs text-on-surface-variant mb-2">No projects yet in this workspace</p>
                        <Link
                          href="/workspaces/new-project"
                          className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                          <span>Create First Project</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {wsProjects.slice(0, 4).map(proj => {
                          const projTasks = tasks.filter(t => t.projectId === proj.id)
                          const projDone = projTasks.filter(t => t.status === 'done').length

                          return (
                            <div
                              key={proj.id}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-base shrink-0">{proj.icon || '📁'}</span>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-on-surface truncate">{proj.name}</div>
                                  <div className="text-[10px] text-outline font-code-metric">
                                    {projTasks.length} tasks &bull; {projDone} done
                                  </div>
                                </div>
                              </div>

                              {/* View Buttons */}
                              <div className="flex items-center gap-1 shrink-0">
                                <Link
                                  href={`/${ws.slug}/${proj.id}/board`}
                                  className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-colors"
                                  title="Kanban Board"
                                >
                                  <span className="material-symbols-outlined text-base">view_kanban</span>
                                </Link>
                                <Link
                                  href={`/${ws.slug}/${proj.id}/list`}
                                  className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-secondary transition-colors"
                                  title="List Table"
                                >
                                  <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                                </Link>
                                <Link
                                  href={`/${ws.slug}/${proj.id}/calendar`}
                                  className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-tertiary transition-colors"
                                  title="Calendar"
                                >
                                  <span className="material-symbols-outlined text-base">calendar_month</span>
                                </Link>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Interactive Task Execution Hub (1-Click Completion) ── */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-on-surface font-headline-md flex items-center gap-2">
                <span>Interactive Tasks Hub</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary/15 text-secondary">
                  1-Click Complete
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant">
                Tick tasks completed directly from the dashboard across all your workspaces
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-8 pl-7 pr-3 text-xs rounded-lg bg-surface-container border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48"
                />
                <span className="material-symbols-outlined absolute left-2 top-2 text-xs text-outline">search</span>
              </div>

              <div className="flex items-center bg-surface-container p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setTaskFilter('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    taskFilter === 'all' ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskFilter('urgent')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    taskFilter === 'urgent' ? 'bg-error text-on-error font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Urgent
                </button>
                <button
                  type="button"
                  onClick={() => setTaskFilter('done')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    taskFilter === 'done' ? 'bg-secondary text-on-secondary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Completed ({doneCount})
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Task Cards Grid / List */}
          <div className="rounded-xl border bg-surface-container-low overflow-hidden shadow-sm" style={{ borderColor: 'var(--color-outline-variant)' }}>
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-outline mb-2 block">task_alt</span>
                <p className="text-sm font-medium">No tasks found in this view</p>
                <p className="text-xs text-outline mt-1">All caught up or create a new task to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {filteredTasks.slice(0, 12).map(task => {
                  const isDone = task.status === 'done'
                  const taskCode = `WM-${task.id.slice(0, 4).toUpperCase()}`

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-surface-container ${
                        isDone ? 'bg-surface-container-lowest/30 opacity-70' : ''
                      }`}
                    >
                      {/* Checkbox and Title */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* 1-Click Interactive Completion Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id, task.status)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 cursor-pointer border ${
                            isDone
                              ? 'bg-secondary border-secondary text-surface-container-lowest scale-105'
                              : 'border-outline/80 hover:border-primary bg-surface-container-highest/60 hover:scale-105'
                          }`}
                          title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {isDone && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-code-metric text-[10px] font-semibold text-primary">{taskCode}</span>
                            <span className="text-[10px] text-outline font-medium px-1.5 py-0.2 rounded bg-surface-container-highest">
                              {task.workspaceName} / {task.projectName}
                            </span>
                            {task.priority === 'urgent' && (
                              <span className="text-[10px] font-bold text-error uppercase">Urgent</span>
                            )}
                          </div>
                          <div className={`text-xs sm:text-sm font-medium truncate ${isDone ? 'line-through text-outline' : 'text-on-surface'}`}>
                            {task.title}
                          </div>
                        </div>
                      </div>

                      {/* Right Meta & Direct Board Link */}
                      <div className="flex items-center gap-3 shrink-0">
                        {task.dueDate && (
                          <span className="text-[11px] text-outline hidden sm:flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">event</span>
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          isDone ? 'bg-secondary/20 text-secondary' :
                          task.status === 'in_progress' ? 'bg-tertiary/20 text-tertiary' :
                          task.status === 'in_review' ? 'bg-cyan-500/20 text-cyan-300' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>

                        <Link
                          href={`/${task.workspaceSlug}/${task.projectId}/board`}
                          className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                          title="Open in Project Board"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
