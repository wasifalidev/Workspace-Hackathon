import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'

export const metadata = { title: 'My Tasks' }

export default async function MyTasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, projects(name, color, icon, workspaces(slug))')
    .eq('assignee_id', user.id)
    .not('status', 'in', '(done,cancelled)')
    .order('due_date', { ascending: true, nullsFirst: false })

  const grouped: Record<string, typeof tasks> = {
    urgent: [], high: [], medium: [], low: [], no_priority: []
  }
  ;(tasks ?? []).forEach((t: Record<string, unknown>) => {
    const p = t.priority as string
    grouped[p] = [...(grouped[p] ?? []), t]
  })

  function statusIcon(status: string) {
    const m: Record<string, [string, string]> = {
      backlog: ['radio_button_unchecked', 'var(--color-outline)'],
      todo: ['circle', 'var(--color-outline-variant)'],
      in_progress: ['pending', 'var(--color-tertiary)'],
      in_review: ['fact_check', 'var(--color-primary)'],
    }
    return m[status] ?? ['radio_button_unchecked', 'var(--color-outline)']
  }

  function priorityColor(p: string) {
    const m: Record<string, string> = { urgent: 'var(--color-error)', high: 'var(--color-tertiary)', medium: 'var(--color-primary)', low: 'var(--color-outline)', no_priority: 'var(--color-outline-variant)' }
    return m[p] ?? 'var(--color-outline)'
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>My Tasks</h1>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>All tasks assigned to you across all workspaces</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{ background: 'rgba(192,193,255,0.12)', color: 'var(--color-primary)', border: '1px solid rgba(192,193,255,0.2)' }}>
          {(tasks ?? []).length} active
        </span>
      </div>

      {(tasks ?? []).length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: 'var(--color-outline)' }}>task_alt</span>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-on-surface)' }}>You&apos;re all caught up!</h3>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>No tasks are currently assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([priority, items]) => {
            if (!items?.length) return null
            return (
              <div key={priority}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: priorityColor(priority) }}></span>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {priority.replace('_', ' ')} ({items.length})
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
                  {items.map((task: Record<string, unknown>, i: number) => {
                    const proj = task.projects as Record<string, unknown> | null
                    const ws = proj?.workspaces as Record<string, string> | null
                    const href = ws ? `/${ws.slug}/${task.project_id}/tasks/${task.id}` : '#'
                    const [statusIco, statusColor] = statusIcon(task.status as string)
                    return (
                      <div key={task.id as string}
                        className={`flex items-center gap-4 px-5 py-3.5 hover:bg-surface-container transition-colors ${i > 0 ? 'border-t' : ''}`}
                        style={{ borderColor: 'var(--color-outline-variant)' }}>
                        <span className="material-symbols-outlined text-lg flex-shrink-0" style={{ color: statusColor }}>{statusIco}</span>
                        <div className="flex-1 min-w-0">
                          <Link href={href} className="text-sm font-medium hover:underline truncate block" style={{ color: 'var(--color-on-surface)' }}>
                            {task.title as string}
                          </Link>
                          {proj && (
                            <span className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                              {proj.icon as string} {proj.name as string}
                            </span>
                          )}
                        </div>
                        {Boolean(task.due_date) && (
                          <span className="text-xs flex-shrink-0 font-mono" style={{ color: new Date(task.due_date as string) < new Date() ? 'var(--color-error)' : 'var(--color-on-surface-variant)' }}>
                            {format(new Date(task.due_date as string), 'MMM d')}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
