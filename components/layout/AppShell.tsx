'use client'

import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUser } from '@/store/slices/authSlice'
import { setWorkspaces, setCurrentWorkspace } from '@/store/slices/workspaceSlice'
import { setProjects } from '@/store/slices/projectSlice'
import Sidebar from './Sidebar'
import Header from './Header'
import CommandPalette from '@/components/ui/CommandPalette'
import type { Workspace } from '@/store/slices/workspaceSlice'
import type { Project } from '@/store/slices/projectSlice'

interface AppShellProps {
  children: React.ReactNode
  initialUser: {
    id: string; email: string; fullName: string | null
    avatarUrl: string | null; isPlatformAdmin: boolean
  } | null
  initialWorkspaces: Workspace[]
  initialCurrentWorkspace: Workspace | null
  initialProjects: Project[]
}

export default function AppShell({
  children, initialUser, initialWorkspaces, initialCurrentWorkspace, initialProjects
}: AppShellProps) {
  const dispatch = useAppDispatch()
  const sidebarCollapsed = useAppSelector(s => s.ui.sidebarCollapsed)
  const workspaces = useAppSelector(s => s.workspace.workspaces)
  const currentWorkspace = useAppSelector(s => s.workspace.currentWorkspace)
  const projects = useAppSelector(s => s.project.projects)

  // Hydrate Redux from server-fetched data
  const hydrate = useCallback(() => {
    if (initialUser) dispatch(setUser(initialUser))
    if (initialWorkspaces.length > 0) dispatch(setWorkspaces(initialWorkspaces))
    if (initialCurrentWorkspace) dispatch(setCurrentWorkspace(initialCurrentWorkspace))
    if (initialProjects.length > 0) dispatch(setProjects(initialProjects))
  }, [dispatch, initialUser, initialWorkspaces, initialCurrentWorkspace, initialProjects])

  useEffect(() => { hydrate() }, [hydrate])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Sidebar
        workspaces={workspaces.length > 0 ? workspaces : initialWorkspaces}
        currentWorkspace={currentWorkspace ?? initialCurrentWorkspace}
        projects={projects.length > 0 ? projects : initialProjects}
      />
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 pl-0 ${
          sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        <Header />
        <main
          className="flex-1 w-full"
          style={{ paddingTop: '3.25rem', background: 'var(--color-surface)', minHeight: '100vh' }}
        >
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
