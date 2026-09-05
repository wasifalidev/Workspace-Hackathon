'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Listen for navigation clicks across the document
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('/#') &&
        !href.startsWith('//') &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        // If navigating to the same URL, ignore
        if (href === window.location.pathname) return

        setLoading(true)
        setProgress(25)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Simulated progress while navigating
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (loading && progress < 85) {
      timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 18, 88))
      }, 180)
    }
    return () => clearTimeout(timer)
  }, [loading, progress])

  // Complete progress on pathname change
  useEffect(() => {
    if (loading) {
      setProgress(100)
      const completeTimer = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 250)
      return () => clearTimeout(completeTimer)
    }
  }, [pathname])

  if (!loading && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 pointer-events-none transition-all duration-200 ease-out"
      style={{
        zIndex: 99999,
        height: '3px',
        opacity: progress === 100 ? 0 : 1,
      }}
    >
      <div
        className="h-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #8083ff 0%, #c0c1ff 50%, #4edea3 100%)',
          boxShadow: '0 0 12px rgba(78, 222, 163, 0.8), 0 0 6px rgba(192, 193, 255, 0.6)',
        }}
      />
    </div>
  )
}
