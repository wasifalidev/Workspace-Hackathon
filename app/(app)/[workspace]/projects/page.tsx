'use client'

import React, { useState, use } from 'react'
import Link from 'next/link'
import { useAppSelector } from '@/store'
import { Button } from '@/components/ui/Button'
import { EditProjectModal } from '@/components/projects/EditProjectModal'
import { AppIcon } from '@/components/ui/AppIcon'
import type { Project } from '@/store/slices/projectSlice'

export default function WorkspaceProjectsPage({
  params,
}: {
  params: Promise<{ workspace: string }>
}) {
  const resolvedParams = use(params)
  const { workspace: workspaceSlug } = resolvedParams

  const currentWorkspace = useAppSelector(s => s.workspace.currentWorkspace)
  const projects = useAppSelector(s => s.project.projects)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline-lg">Projects</h1>
          <p className="text-xs text-on-surface-variant mt-1 font-body-sm">
            All active projects in {currentWorkspace?.name || workspaceSlug}.
          </p>
        </div>
        <Link href="/workspaces/new-project">
          <Button variant="primary" icon="add">
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map(p => (
          <div
            key={p.id}
            className="bg-surface-container-low border border-outline-variant hover:border-outline rounded-xl p-5 shadow-sm space-y-4 transition-all hover:bg-surface-container"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${p.color || '#c0c1ff'}20`, color: p.color || '#c0c1ff' }}
                >
                  <AppIcon name={p.icon || 'folder'} size={22} color={p.color || '#c0c1ff'} />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface text-sm">{p.name}</h3>
                  <span className="text-[11px] text-outline font-code-metric">
                    Created {new Date(p.createdAt || (p as any).created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(p)}
                className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                title="Edit project settings"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant line-clamp-2">
              {p.description || 'No description provided for this project.'}
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/40">
              <Link
                href={`/${workspaceSlug}/${p.id}/board`}
                className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-center text-xs font-medium text-on-surface transition-colors"
              >
                Board
              </Link>
              <Link
                href={`/${workspaceSlug}/${p.id}/list`}
                className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-center text-xs font-medium text-on-surface transition-colors"
              >
                List
              </Link>
              <Link
                href={`/${workspaceSlug}/${p.id}/calendar`}
                className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-center text-xs font-medium text-on-surface transition-colors"
              >
                Calendar
              </Link>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full p-12 text-center bg-surface-container-low border border-dashed border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">folder_open</span>
            <p className="text-sm font-medium text-on-surface">No projects yet</p>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">
              Get started by creating your first team project.
            </p>
            <Link href="/workspaces/new-project">
              <Button variant="primary" icon="add">
                Create Project
              </Button>
            </Link>
          </div>
        )}
      </div>

      <EditProjectModal
        project={editingProject}
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}
