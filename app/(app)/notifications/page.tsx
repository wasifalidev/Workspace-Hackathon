import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export const metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, actor:profiles!notifications_actor_id_fkey(full_name, avatar_url)')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  function notifIcon(type: string) {
    const m: Record<string, [string, string]> = {
      task_assigned: ['assignment_ind', 'var(--color-primary)'],
      task_mentioned: ['alternate_email', 'var(--color-secondary)'],
      comment_mentioned: ['comment', 'var(--color-secondary)'],
      task_due_soon: ['schedule', 'var(--color-tertiary)'],
      task_overdue: ['warning', 'var(--color-error)'],
      comment_added: ['comment', 'var(--color-primary-fixed-dim)'],
      project_invitation: ['group_add', 'var(--color-secondary)'],
      workspace_invitation: ['corporate_fare', 'var(--color-secondary)'],
      task_status_changed: ['cached', 'var(--color-primary)'],
    }
    return m[type] ?? ['notifications', 'var(--color-outline)']
  }

  const unread = (notifications ?? []).filter((n: Record<string, unknown>) => !n.is_read)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>Notifications</h1>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <button type="button" className="btn-ghost text-sm px-4 py-2 rounded-lg flex items-center gap-2"
            style={{ border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
            <span className="material-symbols-outlined text-base">done_all</span>
            Mark all read
          </button>
        )}
      </div>

      {(notifications ?? []).length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: 'var(--color-outline)' }}>notifications_none</span>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-on-surface)' }}>No notifications yet</h3>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>You&apos;ll be notified when something important happens.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
          {(notifications ?? []).map((notif: Record<string, unknown>, i: number) => {
            const [icon, color] = notifIcon(notif.type as string)
            const actor = notif.actor as Record<string, string> | null
            return (
              <div key={notif.id as string}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${!notif.is_read ? 'bg-primary/[0.04]' : ''} hover:bg-surface-container ${i > 0 ? 'border-t' : ''}`}
                style={{ borderColor: 'var(--color-outline-variant)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                  <span className="material-symbols-outlined text-lg" style={{ color }}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-on-surface)' }}>
                      {notif.title as string}
                    </p>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--color-primary)' }}></span>
                    )}
                  </div>
                  {Boolean(notif.message) && (
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-on-surface-variant)' }}>{notif.message as string}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {actor && (
                      <span className="text-xs" style={{ color: 'var(--color-outline)' }}>{actor.full_name}</span>
                    )}
                    <span className="text-[10px] font-mono" style={{ color: 'var(--color-outline)' }}>
                      {format(new Date(notif.created_at as string), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
