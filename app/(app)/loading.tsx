import React from 'react'

export default function Loading() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-surface animate-pulse">
      {/* Skeleton Top Context Bar */}
      <div
        className="px-6 sm:px-8 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b"
        style={{
          background: 'rgba(24,28,36,0.5)',
          borderColor: 'var(--color-outline-variant)',
        }}
      >
        <div className="space-y-2">
          <div className="h-3 w-28 bg-surface-container-high rounded-full" />
          <div className="h-8 w-64 bg-surface-container-highest rounded-lg" />
          <div className="h-4 w-96 bg-surface-container-high rounded" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-32 bg-surface-container-high rounded-lg" />
          <div className="h-9 w-28 bg-surface-container-highest rounded-lg" />
        </div>
      </div>

      {/* Skeleton Content Area */}
      <div className="px-6 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="p-4 rounded-xl border bg-surface-container-low space-y-3"
              style={{ borderColor: 'var(--color-outline-variant)' }}
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-surface-container-high rounded" />
                <div className="w-6 h-6 rounded bg-surface-container-high" />
              </div>
              <div className="h-7 w-16 bg-surface-container-highest rounded" />
              <div className="h-2.5 w-28 bg-surface-container-high rounded" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="p-5 rounded-xl border bg-surface-container-low h-64 flex flex-col justify-between"
              style={{ borderColor: 'var(--color-outline-variant)' }}
            >
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-surface-container-high rounded" />
                <div className="h-3 w-48 bg-surface-container rounded" />
              </div>
              <div className="w-32 h-32 rounded-full bg-surface-container-high mx-auto my-auto opacity-50" />
              <div className="h-3 w-full bg-surface-container-high rounded" />
            </div>
          ))}
        </div>

        {/* Section Skeleton */}
        <div className="rounded-xl border bg-surface-container-low p-6 space-y-4" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <div className="h-5 w-48 bg-surface-container-high rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 w-full bg-surface-container rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
