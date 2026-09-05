'use client'

import React from 'react'
import type { Task, TaskPriority } from '@/store/slices/taskSlice'
import { Avatar } from '@/components/ui/Avatar'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  onStatusChange?: (newStatus: Task['status']) => void
}

export function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  // Priority icon and color
  const priorityConfig: Record<TaskPriority, { icon: string; color: string; label: string }> = {
    urgent: { icon: 'emergency', color: 'text-error', label: 'Urgent' },
    high: { icon: 'error', color: 'text-error', label: 'High' },
    medium: { icon: 'density_medium', color: 'text-tertiary', label: 'Medium' },
    low: { icon: 'low_priority', color: 'text-outline', label: 'Low' },
    no_priority: { icon: 'horizontal_rule', color: 'text-outline', label: 'None' },
  }

  const priority = priorityConfig[task.priority] || priorityConfig.no_priority

  // Friendly task code (e.g. WM-142 from uuid or id)
  const taskCode = `WM-${task.id.slice(0, 4).toUpperCase()}`

  return (
    <div
      onClick={onClick}
      className="group relative p-3.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all shadow-sm border border-outline-variant/30 hover:border-outline-variant cursor-pointer select-none"
    >
      {/* Top line: ID and drag indicator */}
      <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
        <span className="font-code-metric text-[11px] text-primary font-medium tracking-tight">
          {taskCode}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-outline text-[14px]">
            drag_indicator
          </span>
        </div>
      </div>

      {/* Task title */}
      <p className="text-sm font-medium text-on-surface mb-2.5 leading-snug line-clamp-2">
        {task.title}
      </p>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.labels.map(label => (
            <span
              key={label.id}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium font-label-sm"
              style={{
                background: `${label.color || '#c0c1ff'}20`,
                color: label.color || '#c0c1ff',
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer: priority, due date / points, assignee */}
      <div className="flex items-center justify-between pt-1 text-on-surface-variant text-[11px] font-code-metric">
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined text-[15px] ${priority.color}`}
            title={`Priority: ${priority.label}`}
          >
            {priority.icon}
          </span>
          {task.dueDate && (
            <span className="text-[10px] text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">event</span>
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          {task.estimatePoints && (
            <span className="px-1 py-0.5 rounded bg-surface-container-highest text-[10px]">
              {task.estimatePoints} pts
            </span>
          )}
        </div>

        <Avatar
          src={task.assignee?.avatarUrl}
          name={task.assignee?.fullName || 'Unassigned'}
          size="xs"
        />
      </div>
    </div>
  )
}
