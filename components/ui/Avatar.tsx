import React from 'react'

export interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  online?: boolean
  className?: string
}

export function Avatar({
  src,
  name,
  size = 'md',
  online,
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size]

  const indicatorSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }[size]

  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeClasses} rounded-full object-cover ring-1 ring-outline-variant/40`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full bg-surface-container-highest text-primary font-semibold flex items-center justify-center ring-1 ring-outline-variant/40`}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${indicatorSizes} rounded-full ring-2 ring-surface ${
            online ? 'bg-secondary' : 'bg-outline'
          }`}
        />
      )}
    </div>
  )
}
