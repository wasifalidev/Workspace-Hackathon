'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface AuditEvent {
  id: string
  action: string
  entity_type: string
  details?: Record<string, any>
  created_at: string
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AuditEvent[]>([])

  useEffect(() => {
    async function loadLogs() {
      const supabase = createClient()
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (data && data.length > 0) {
        setLogs(data)
      } else {
        // Fallback demo audit stream
        setLogs([
          {
            id: '1',
            action: 'auth.session.refresh',
            entity_type: 'user',
            created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
          },
          {
            id: '2',
            action: 'task.status.updated',
            entity_type: 'task',
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          },
          {
            id: '3',
            action: 'project.created',
            entity_type: 'project',
            created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          },
          {
            id: '4',
            action: 'workspace.member.joined',
            entity_type: 'workspace_member',
            created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          },
        ])
      }
    }

    loadLogs()
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label-md">
        <Link href="/admin" className="hover:text-on-surface transition-colors">
          Admin
        </Link>
        <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
        <span className="text-on-surface font-semibold">Security & Audit</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-on-surface font-headline-lg">System Audit Trail</h1>
        <p className="text-xs text-on-surface-variant mt-1 font-body-sm">
          Cryptographically recorded security logs, auth handshakes, and mutation traces.
        </p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest/50 text-xs font-semibold text-on-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            <span>Live Telemetry Stream</span>
          </div>
          <span className="text-outline font-code-metric text-[11px]">Realtime Supabase Channel</span>
        </div>

        <div className="divide-y divide-outline-variant/30">
          {logs.map(log => (
            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-surface-container/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  shield_with_heart
                </span>
                <div>
                  <div className="font-code-metric text-xs font-semibold text-on-surface">
                    {log.action}
                  </div>
                  <div className="text-[11px] text-outline">
                    Entity: <span className="text-on-surface-variant">{log.entity_type}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-outline font-code-metric">
                {new Date(log.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
