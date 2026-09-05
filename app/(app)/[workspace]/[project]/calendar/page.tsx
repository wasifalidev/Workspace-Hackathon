'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppSelector } from '@/store'
import { Task } from '@/store/slices/taskSlice'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { NewTaskModal } from '@/components/tasks/NewTaskModal'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'

export default function ProjectCalendarViewPage({
  params,
}: {
  params: Promise<{ workspace: string; project: string }>
}) {
  const resolvedParams = use(params)
  const { workspace: workspaceSlug, project: projectId } = resolvedParams

  const tasks = useAppSelector(s => s.task.tasks)
  const currentProject = useAppSelector(s => s.project.currentProject)

  const [currentDate, setCurrentDate] = useState(new Date())
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

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const projectTasks = tasks.filter(t => !t.projectId || t.projectId === projectId)
  const projectName = projectData?.name || currentProject?.name || 'Project'

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Header banner */}
      <div className="px-6 sm:px-8 pt-6 pb-2 bg-surface-container-lowest border-b border-outline-variant/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2 font-headline-lg">
              <span className="text-tertiary">{projectData?.icon || '⚡'}</span>
              <span>{projectName}</span>
            </h1>
            <p className="text-xs text-on-surface-variant mt-1 font-body-sm">
              Schedule and milestones by due date.
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
            className="flex items-center gap-1.5 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            <span>List / Table</span>
          </Link>
          <Link
            href={`/${workspaceSlug}/${projectId}/calendar`}
            className="flex items-center gap-1.5 py-2 text-xs font-semibold text-primary relative"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Calendar</span>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          </Link>
        </div>
      </div>

      {/* Calendar navigation */}
      <div className="px-6 sm:px-8 py-3 bg-surface-container-low border-b border-outline-variant/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-on-surface">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              type="button"
              className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              type="button"
              className="px-2.5 py-0.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              type="button"
              className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Month grid */}
      <div className="flex-1 p-6 sm:p-8">
        <div className="grid grid-cols-7 gap-px bg-outline-variant/40 rounded-xl overflow-hidden border border-outline-variant/60">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="bg-surface-container-low py-2 text-center text-xs font-semibold text-outline uppercase font-label-sm"
            >
              {day}
            </div>
          ))}

          {days.map(day => {
            const isCurMonth = isSameMonth(day, monthStart)
            const isToday = isSameDay(day, new Date())
            const dayTasks = projectTasks.filter(
              t => t.dueDate && isSameDay(new Date(t.dueDate), day)
            )

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[110px] p-2 transition-colors flex flex-col ${
                  isCurMonth ? 'bg-surface' : 'bg-surface-container-lowest opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-code-metric font-semibold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center'
                        : isCurMonth
                        ? 'text-on-surface'
                        : 'text-outline'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-outline font-code-metric">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto flex-1 max-h-[85px]">
                  {dayTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="text-[11px] p-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer truncate border-l-2 border-primary text-on-surface font-medium"
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
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
