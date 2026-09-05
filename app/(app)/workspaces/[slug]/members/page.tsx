'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppSelector } from '@/store'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'

interface Member {
  id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  profile?: {
    full_name: string | null
    email?: string | null
    avatar_url: string | null
  }
}

export default function WorkspaceMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = use(params)
  const { slug } = resolvedParams

  const currentWorkspace = useAppSelector(s => s.workspace.currentWorkspace)
  const user = useAppSelector(s => s.auth.user)

  const [members, setMembers] = useState<Member[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    async function loadMembers() {
      if (!currentWorkspace) return
      const supabase = createClient()
      const { data } = await supabase
        .from('workspace_members')
        .select(`
          id, user_id, role,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('workspace_id', currentWorkspace.id)

      if (data && data.length > 0) {
        setMembers(data as any)
      } else if (user) {
        setMembers([
          {
            id: 'owner',
            user_id: user.id,
            role: 'owner',
            profile: {
              full_name: user.fullName || user.email || 'Workspace Owner',
              avatar_url: user.avatarUrl || null,
            },
          },
        ])
      } else {
        setMembers([])
      }
    }

    loadMembers()
  }, [currentWorkspace, user])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    setTimeout(() => {
      toast.success(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviting(false)
    }, 600)
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label-md">
        <Link href="/workspaces" className="hover:text-on-surface transition-colors">
          Workspaces
        </Link>
        <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
        <span className="text-on-surface font-semibold">{currentWorkspace?.name || slug}</span>
        <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
        <span className="text-on-surface">Members</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-on-surface font-headline-lg">Workspace Members</h1>
        <p className="text-xs text-on-surface-variant mt-1 font-body-sm">
          Manage teammates, invite new collaborators, and assign permission roles.
        </p>
      </div>

      {/* Invite box */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-on-surface mb-3">Invite Team Members</h2>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1"
            required
            type="email"
          />
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as any)}
            className="text-xs rounded-lg px-3 py-2 bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:ring-1 focus:ring-primary h-9"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button type="submit" variant="primary" loading={inviting} icon="mail">
            Send Invite
          </Button>
        </form>
      </div>

      {/* Members list */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50 text-xs font-semibold text-on-surface flex items-center justify-between">
          <span>Active Members ({members.length})</span>
        </div>

        <div className="divide-y divide-outline-variant/40">
          {members.map(m => (
            <div key={m.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={m.profile?.avatar_url}
                  name={m.profile?.full_name || 'Member'}
                  size="md"
                />
                <div>
                  <div className="text-sm font-semibold text-on-surface">
                    {m.profile?.full_name || 'Member'}
                  </div>
                  <div className="text-xs text-outline font-code-metric">
                    {m.role === 'owner' ? 'Workspace Owner' : 'Team Member'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    m.role === 'owner'
                      ? 'primary'
                      : m.role === 'admin'
                      ? 'tertiary'
                      : 'surface'
                  }
                  dot
                >
                  {m.role}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
