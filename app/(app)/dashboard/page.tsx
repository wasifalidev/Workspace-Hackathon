import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns'
import Link from 'next/link'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch first workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name, slug)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const workspaceId = membership?.workspace_id

  // Stats
  const [projectsRes, activeTasksRes, completedTasksRes, overdueTasksRes, myTasksRes, activityRes] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact' }).eq('workspace_id', workspaceId ?? '').eq('status', 'active'),
    supabase.from('tasks').select('id', { count: 'exact' }).in('project_id',
      (await supabase.from('projects').select('id').eq('workspace_id', workspaceId ?? '')).data?.map(p => p.id) ?? []
    ).not('status', 'in', '(done,cancelled)'),
    supabase.from('tasks').select('id', { count: 'exact' }).in('project_id',
      (await supabase.from('projects').select('id').eq('workspace_id', workspaceId ?? '')).data?.map(p => p.id) ?? []
    ).eq('status', 'done'),
    supabase.from('tasks').select('id', { count: 'exact' }).in('project_id',
      (await supabase.from('projects').select('id').eq('workspace_id', workspaceId ?? '')).data?.map(p => p.id) ?? []
    ).lt('due_date', new Date().toISOString().split('T')[0]).not('status', 'in', '(done,cancelled)'),
    supabase.from('tasks')
      .select('id, title, status, priority, due_date, projects(name, color, icon)')
      .eq('assignee_id', user.id)
      .not('status', 'in', '(done,cancelled)')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(6),
    supabase.from('activity_logs')
      .select('id, action, metadata, created_at, actor:profiles(full_name, avatar_url)')
      .eq('workspace_id', workspaceId ?? '')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const stats = {
    projects: projectsRes.count ?? 0,
    active: activeTasksRes.count ?? 0,
    completed: completedTasksRes.count ?? 0,
    overdue: overdueTasksRes.count ?? 0,
  }

  const myTasks = myTasksRes.data ?? []
  const activity = activityRes.data ?? []

  function priorityBadge(p: string) {
    const map: Record<string, string> = { urgent: 'badge-urgent', high: 'badge-high', medium: 'badge-medium', low: 'badge-low', no_priority: 'badge-backlog' }
    return map[p] ?? 'badge-backlog'
  }

  function dueDateDisplay(date: string | null) {
    if (!date) return null
    const d = new Date(date)
    if (isPast(d)) return { label: 'Overdue', color: 'var(--color-error)' }
    if (isToday(d)) return { label: 'Today', color: 'var(--color-tertiary)' }
    if (isTomorrow(d)) return { label: 'Tomorrow', color: 'var(--color-tertiary)' }
    return { label: format(d, 'MMM d'), color: 'var(--color-on-surface-variant)' }
  }

  function actionLabel(action: string) {
    const map: Record<string, string> = {
      task_created: 'created task', task_status_changed: 'changed status of',
      task_priority_changed: 'changed priority of', task_assignee_changed: 'reassigned',
      comment_added: 'commented on', project_created: 'created project',
      member_invited: 'invited a member', task_completed: 'completed',
    }
    return map[action] ?? action.replace(/_/g, ' ')
  }

  return (
    <div className="flex flex-col w-full">
      {/* ── Context Bar ── */}
      <div className="px-6 py-5 flex flex-col md:flex-row md:items-end justify-between gap-4"
        style={{ background: 'rgba(24,28,36,0.4)', borderBottom: '1px solid var(--color-outline-variant)' }}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }}></span>
            Executive Command Center
          </div>
          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-on-surface)', letterSpacing: '-0.025em' }}>
              Workspace Overview
            </h1>
            <span className="hidden sm:inline px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(78,222,163,0.1)', color: 'var(--color-secondary)' }}>
              All Systems Nominal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/dashboard/tasks/new"
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold">
            <span className="material-symbols-outlined text-lg">add</span>
            Quick Create
          </Link>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: stats.projects, icon: 'account_tree', color: 'var(--color-primary)', sub: 'Active projects' },
            { label: 'Active Tasks', value: stats.active, icon: 'tune', color: 'var(--color-primary-fixed-dim)', sub: 'In progress' },
            { label: 'Completed Tasks', value: stats.completed, icon: 'task_alt', color: 'var(--color-secondary)', sub: 'This workspace' },
            { label: 'Overdue Tasks', value: stats.overdue, icon: 'warning', color: 'var(--color-error)', sub: stats.overdue > 0 ? 'Action required' : 'All on track' },
          ].map(({ label, value, icon, color, sub }) => (
            <div key={label} className="relative rounded-xl p-4 overflow-hidden group hover:scale-[1.01] transition-transform"
              style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>{label}</span>
                <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: label === 'Overdue Tasks' && value > 0 ? color : 'var(--color-on-surface)' }}>
                {value}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{sub}</div>
              <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full pointer-events-none"
                style={{ background: `color-mix(in srgb, ${color} 8%, transparent)`, filter: 'blur(12px)' }}></div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            {/* My Assigned Tasks */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-primary)' }}>assignment_ind</span>
                  <h2 className="font-semibold text-base" style={{ color: 'var(--color-on-surface)' }}>My Assigned Tasks</h2>
                  {myTasks.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(192,193,255,0.15)', color: 'var(--color-primary)' }}>
                      {myTasks.length} active
                    </span>
                  )}
                </div>
                <Link href="/my-tasks" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                  View All <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
              {myTasks.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <span className="material-symbols-outlined text-4xl mb-3 block" style={{ color: 'var(--color-outline)' }}>task_alt</span>
                  <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>No tasks assigned to you</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--color-outline-variant)' }}>
                  {myTasks.map((task: Record<string, unknown>) => {
                    const due = dueDateDisplay(task.due_date as string | null)
                    const proj = task.projects as Record<string, string> | null
                    return (
                      <div key={task.id as string} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors group">
                        <button type="button" className="w-4 h-4 rounded border flex-shrink-0 transition-colors"
                          style={{ border: '1.5px solid var(--color-outline-variant)' }}></button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-white transition-colors" style={{ color: 'var(--color-on-surface)' }}>
                            {task.title as string}
                          </p>
                          {proj && (
                            <span className="text-xs mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                              {proj.icon} {proj.name}
                            </span>
                          )}
                        </div>
                        <span className={`badge ${priorityBadge(task.priority as string)} flex-shrink-0 hidden sm:inline-flex`}>
                          {(task.priority as string).replace('_', ' ')}
                        </span>
                        {due && (
                          <span className="text-xs flex-shrink-0 flex items-center gap-1 font-mono" style={{ color: due.color }}>
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {due.label}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Task Status Distribution */}
            <div className="rounded-xl p-6" style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
              <h2 className="font-semibold text-base mb-5" style={{ color: 'var(--color-on-surface)' }}>Sprint Workflow Balance</h2>
              {stats.active + stats.completed > 0 ? (
                <>
                  <div className="h-3 w-full rounded-full overflow-hidden flex gap-0.5 mb-4"
                    style={{ background: 'var(--color-surface-container-highest)' }}>
                    {[
                      { pct: Math.round((stats.active * 0.15) / Math.max(stats.active + stats.completed, 1) * 100), color: 'var(--color-outline-variant)' },
                      { pct: Math.round((stats.active * 0.25) / Math.max(stats.active + stats.completed, 1) * 100), color: 'var(--color-surface-container-high)' },
                      { pct: Math.round((stats.active * 0.35) / Math.max(stats.active + stats.completed, 1) * 100), color: 'var(--color-primary)' },
                      { pct: Math.round((stats.active * 0.10) / Math.max(stats.active + stats.completed, 1) * 100), color: 'var(--color-tertiary)' },
                      { pct: Math.round(stats.completed / Math.max(stats.active + stats.completed, 1) * 100), color: 'var(--color-secondary)' },
                    ].map((seg, i) => (
                      <div key={i} className="h-full transition-all" style={{ width: `${seg.pct}%`, background: seg.color, borderRadius: i === 0 ? '9999px 0 0 9999px' : i === 4 ? '0 9999px 9999px 0' : '0' }}></div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {[
                      ['var(--color-outline-variant)', 'Backlog'],
                      ['var(--color-surface-container-high)', 'To Do'],
                      ['var(--color-primary)', 'In Progress'],
                      ['var(--color-tertiary)', 'Review'],
                      ['var(--color-secondary)', 'Done'],
                    ].map(([color, label]) => (
                      <div key={label as string} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color as string }}></span>
                        {label}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-center py-6" style={{ color: 'var(--color-on-surface-variant)' }}>No task data yet. Create your first project and tasks.</p>
              )}
            </div>
          </div>

          {/* Right 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Activity Feed */}
            <div className="rounded-xl" style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--color-secondary)' }}></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'var(--color-secondary)' }}></span>
                </span>
                <h2 className="font-semibold text-base" style={{ color: 'var(--color-on-surface)' }}>Live Team Activity</h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--color-outline-variant)' }}>
                {activity.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <span className="material-symbols-outlined text-3xl mb-2 block" style={{ color: 'var(--color-outline)' }}>history</span>
                    <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>Activity will appear here</p>
                  </div>
                ) : (
                  activity.map((log: Record<string, unknown>) => {
                    const actor = log.actor as Record<string, string> | null
                    const meta = log.metadata as Record<string, string>
                    return (
                      <div key={log.id as string} className="flex items-start gap-3 px-5 py-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                          {actor?.full_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-relaxed">
                            <span className="font-semibold" style={{ color: 'var(--color-on-surface)' }}>
                              {actor?.full_name ?? 'Someone'}
                            </span>
                            <span style={{ color: 'var(--color-on-surface-variant)' }}> {actionLabel(log.action as string)}</span>
                            {meta?.title && (
                              <span className="font-medium" style={{ color: 'var(--color-on-surface)' }}> "{meta.title}"</span>
                            )}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-outline)' }}>
                            {format(new Date(log.created_at as string), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
