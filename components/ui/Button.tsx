import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40'
  
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-7',
    md: 'text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
  }[size]

  const variantStyles = {
    primary: 'bg-primary text-on-primary hover:bg-primary-fixed-dim active:scale-[0.98]',
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-bright active:scale-[0.98]',
    ghost: 'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-[0.98]',
    danger: 'bg-error-container text-error hover:bg-error/20 active:scale-[0.98]',
    outline: 'bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container active:scale-[0.98]',
  }[variant]

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
