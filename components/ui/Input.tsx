import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: string
  rightIcon?: string
  onRightIconClick?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  rightIcon,
  onRightIconClick,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-on-surface-variant">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 text-lg text-outline pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary ${
            icon ? 'pl-9' : 'pl-3'
          } ${rightIcon ? 'pr-9' : 'pr-3'} py-2 bg-surface-container-low border text-on-surface placeholder:text-outline ${
            error ? 'border-error ring-1 ring-error' : 'border-outline-variant'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-2.5 text-outline hover:text-on-surface p-1 rounded"
          >
            <span className="material-symbols-outlined text-lg">{rightIcon}</span>
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
