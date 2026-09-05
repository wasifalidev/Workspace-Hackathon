'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'

interface WorkspaceItem {
  id: string
  name: string
  slug: string
  color: string | null
  created_at: string
}

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false })

      setWorkspaces(data || [])
      setLoading(false)
    }

    load()
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label-md">
        <Link href="/admin" className="hover:text-on-surface transition-colors">
          Admin
        </Link>
        <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
        <span className="text-on-surface font-semibold">Workspaces</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline-lg">Tenant Workspaces</h1>
          <p className="text-xs text-on-surface-variant mt-1 font-body-sm">
            All registered organizations and their tenant identifiers.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-lowest/50 text-[11px] font-semibold text-outline uppercase font-label-sm">
              <th className="py-3.5 px-4">Workspace</th>
              <th className="py-3.5 px-4">Slug Identifier</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-xs">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-outline">
                  Loading workspaces from Supabase...
                </td>
              </tr>
            ) : workspaces.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                  No tenant workspaces found in database.
                </td>
              </tr>
            ) : (
              workspaces.map(ws => (
                <tr key={ws.id} className="hover:bg-surface-container/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ background: ws.color || 'var(--color-primary)', color: '#0f131c' }}
                      >
                        {ws.name[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-on-surface">{ws.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-code-metric text-outline">
                    /{ws.slug}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="secondary" dot>Active</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-outline font-code-metric">
                    {new Date(ws.created_at).toLocaleDateString()}
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
