'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Task } from '@/store/slices/taskSlice'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'

export default function DedicatedTaskPage({
  params,
}: {
  params: Promise<{ workspace: string; project: string; taskId: string }>
}) {
  const resolvedParams = use(params)
  const { workspace: workspaceSlug, project: projectId, taskId } = resolvedParams
  const router = useRouter()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTask() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id, project_id, title, description, status, priority,
          assignee_id, due_date, start_date, estimate_points, sort_order,
          created_by, created_at, updated_at,
          assignee:profiles(id, full_name, avatar_url)
        `)
        .eq('id', taskId)
        .single()

      if (data) {
        setTask({
          id: data.id,
          projectId: data.project_id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assigneeId: data.assignee_id,
          dueDate: data.due_date,
          startDate: data.start_date,
          estimatePoints: data.estimate_points,
          sortOrder: data.sort_order,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          assignee: data.assignee
            ? {
                id: (data.assignee as any).id,
                fullName: (data.assignee as any).full_name,
                avatarUrl: (data.assignee as any).avatar_url,
              }
            : undefined,
        })
      } else {
        // Fallback demo task
        setTask({
          id: taskId,
          projectId,
          title: 'Task Details',
          description: 'Loaded via direct link',
          status: 'in_progress',
          priority: 'high',
          assigneeId: null,
          dueDate: null,
          startDate: null,
          estimatePoints: 3,
          sortOrder: 1,
          createdBy: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
      setLoading(false)
    }

    loadTask()
  }, [taskId, projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <TaskDetailModal
      task={task}
      isOpen={true}
      onClose={() => router.push(`/${workspaceSlug}/${projectId}/board`)}
      workspaceSlug={workspaceSlug}
      projectName="Project"
    />
  )
}
