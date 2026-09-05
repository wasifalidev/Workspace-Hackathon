import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'error' | 'surface'
  dot?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  children,
  variant = 'surface',
  dot = false,
  size = 'sm',
  className = '',
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  const variantClasses = {
    primary: 'bg-primary/15 text-primary',
    secondary: 'bg-secondary/15 text-secondary',
    tertiary: 'bg-tertiary/15 text-tertiary',
    error: 'bg-error/15 text-error',
    outline: 'border border-outline-variant text-on-surface-variant',
    surface: 'bg-surface-container-highest text-on-surface-variant',
  }[variant]

  const dotColors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    tertiary: 'bg-tertiary',
    error: 'bg-error',
    outline: 'bg-outline',
    surface: 'bg-outline',
  }[variant]

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full font-label-sm leading-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />}
      {children}
    </span>
  )
}
