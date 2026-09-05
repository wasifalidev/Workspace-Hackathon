'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { toast } from 'sonner'

interface ProfileItem {
  id: string
  full_name: string | null
  email?: string | null
  avatar_url: string | null
  is_platform_admin?: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(data || [])
      setLoading(false)
    }

    load()
  }, [])

  async function toggleAdminRole(userId: string, current: boolean) {
    const updated = users.map(u =>
      u.id === userId ? { ...u, is_platform_admin: !current } : u
    )
    setUsers(updated)

    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ is_platform_admin: !current })
      .eq('id', userId)

    toast.success(
      `User ${!current ? 'granted' : 'revoked'} platform admin status`
    )
  }

  const filtered = users.filter(u =>
    (u.full_name || u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label-md">
        <Link href="/admin" className="hover:text-on-surface transition-colors">
          Admin
        </Link>
        <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
        <span className="text-on-surface font-semibold">Users</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline-lg">User Directory</h1>
          <p className="text-xs text-on-surface-variant mt-1 font-body-sm">
            View all accounts across tenant organizations.
          </p>
        </div>

        <input
          type="text"
          placeholder="Filter by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-8 w-64 px-3 bg-surface-container-low border border-outline-variant text-on-surface text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-lowest/50 text-[11px] font-semibold text-outline uppercase font-label-sm">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-xs">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-outline">
                  Loading users from Supabase...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                  No users found in database.
                </td>
              </tr>
            ) : (
              filtered.map(user => (
                <tr key={user.id} className="hover:bg-surface-container/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar_url} name={user.full_name || 'User'} size="sm" />
                      <div>
                        <div className="font-semibold text-on-surface">{user.full_name || 'Anonymous User'}</div>
                        <div className="text-[11px] text-outline font-code-metric">{user.email || user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {user.is_platform_admin ? (
                      <Badge variant="primary" dot>Platform Admin</Badge>
                    ) : (
                      <Badge variant="surface">Standard User</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-outline font-code-metric">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleAdminRole(user.id, !!user.is_platform_admin)}
                      className="text-xs px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {user.is_platform_admin ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
