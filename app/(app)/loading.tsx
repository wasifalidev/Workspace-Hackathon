import React from 'react'

export default function Loading() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-surface transition-colors duration-200">
      {/* Skeleton Top Context Bar */}
      <div
        className="px-6 sm:px-8 py-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b"
        style={{
          background: 'var(--color-sub-surface)',
          borderColor: 'var(--color-outline-variant)',
        }}
      >
        <div className="space-y-2.5">
          <div className="h-3 w-28 bg-surface-container rounded-full animate-pulse" />
          <div className="h-7 sm:h-8 w-60 sm:w-72 bg-surface-container-high rounded-lg animate-pulse" />
          <div className="h-3.5 w-80 sm:w-96 bg-surface-container rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-8 w-28 bg-surface-container rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-surface-container-high rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Skeleton Content Area */}
      <div className="px-6 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="p-4 rounded-xl border bg-surface-container-low space-y-3.5 shadow-sm"
              style={{ borderColor: 'var(--color-outline-variant)' }}
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-surface-container rounded animate-pulse" />
                <div className="w-5 h-5 rounded-md bg-surface-container animate-pulse" />
              </div>
              <div className="h-6 w-14 bg-surface-container-high rounded animate-pulse" />
              <div className="h-2 w-28 bg-surface-container rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts & Metrics Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="p-5 rounded-xl border bg-surface-container-low h-64 flex flex-col justify-between shadow-sm"
              style={{ borderColor: 'var(--color-outline-variant)' }}
            >
              <div className="space-y-2">
                <div className="h-4 w-36 bg-surface-container-high rounded animate-pulse" />
                <div className="h-2.5 w-48 bg-surface-container rounded animate-pulse" />
              </div>

              {/* Center circular loader mockup */}
              <div className="relative w-28 h-28 rounded-full border-4 border-surface-container-high/60 flex items-center justify-center mx-auto my-auto animate-pulse">
                <div className="w-16 h-16 rounded-full bg-surface-container-high/40" />
              </div>

              <div className="h-2.5 w-full bg-surface-container rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Section Skeleton */}
        <div
          className="rounded-xl border bg-surface-container-low p-6 space-y-4 shadow-sm"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          <div className="h-4 w-44 bg-surface-container-high rounded animate-pulse" />
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-12 w-full bg-surface-container/60 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
