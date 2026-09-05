'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppSelector } from '@/store'

export default function AdminOverviewPage() {
  const user = useAppSelector(s => s.auth.user)
  const [stats, setStats] = useState({
    users: 0,
    workspaces: 0,
    projects: 0,
    tasks: 0,
    loading: true,
  })

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()
      const [uRes, wRes, pRes, tRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('workspaces').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        users: uRes.count ?? 0,
        workspaces: wRes.count ?? 0,
        projects: pRes.count ?? 0,
        tasks: tRes.count ?? 0,
        loading: false,
      })
    }

    loadStats()
  }, [])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            <h1 className="text-2xl font-bold text-on-surface font-headline-lg">System Administration</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-body-sm">
            Platform governance, telemetry, user management, and workspace monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-xs font-semibold font-label-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span>Operational (All Systems Nominal)</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Registered Users',
            val: stats.loading ? '...' : stats.users.toLocaleString(),
            change: 'Live Supabase accounts',
            icon: 'group',
            color: 'text-primary',
          },
          {
            label: 'Active Workspaces',
            val: stats.loading ? '...' : stats.workspaces.toLocaleString(),
            change: 'Tenant organizations',
            icon: 'domain',
            color: 'text-secondary',
          },
          {
            label: 'Total Projects',
            val: stats.loading ? '...' : stats.projects.toLocaleString(),
            change: 'Workspace initiatives',
            icon: 'folder',
            color: 'text-tertiary',
          },
          {
            label: 'Tasks Created',
            val: stats.loading ? '...' : stats.tasks.toLocaleString(),
            change: 'Realtime database tasks',
            icon: 'task_alt',
            color: 'text-primary',
          },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-surface-container-low border border-outline-variant rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-on-surface-variant font-label-sm">{kpi.label}</span>
              <span className={`material-symbols-outlined text-xl ${kpi.color}`}>{kpi.icon}</span>
            </div>
            <div className="text-2xl font-bold text-on-surface font-headline-lg">{kpi.val}</div>
            <div className="text-[11px] text-secondary font-medium font-code-metric">{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="group bg-surface-container-low border border-outline-variant hover:border-primary/60 rounded-xl p-6 transition-all hover:bg-surface-container shadow-sm space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">manage_accounts</span>
          </div>
          <h2 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
            User Management
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Review user accounts, grant platform administrator privileges, audit user profiles.
          </p>
        </Link>

        <Link
          href="/admin/workspaces"
          className="group bg-surface-container-low border border-outline-variant hover:border-secondary/60 rounded-xl p-6 transition-all hover:bg-surface-container shadow-sm space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">domain_verification</span>
          </div>
          <h2 className="text-base font-bold text-on-surface group-hover:text-secondary transition-colors">
            Workspace Governance
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Inspect all tenant organizations, quotas, storage allocations, and workspace ownership.
          </p>
        </Link>

        <Link
          href="/admin/activity"
          className="group bg-surface-container-low border border-outline-variant hover:border-tertiary/60 rounded-xl p-6 transition-all hover:bg-surface-container shadow-sm space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-tertiary/15 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">history_toggle_off</span>
          </div>
          <h2 className="text-base font-bold text-on-surface group-hover:text-tertiary transition-colors">
            Security & Audit Logs
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Real-time system audit trails, authentication events, API usage, and permission changes.
          </p>
        </Link>
      </div>
    </div>
  )
}
