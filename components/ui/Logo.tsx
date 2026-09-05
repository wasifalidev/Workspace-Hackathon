import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  href?: string
  className?: string
  textClassName?: string
  subtitle?: string
}

const sizeMap = {
  xs: { icon: 22, text: 'text-xs', container: 'gap-1.5' },
  sm: { icon: 28, text: 'text-sm', container: 'gap-2' },
  md: { icon: 34, text: 'text-base', container: 'gap-2.5' },
  lg: { icon: 42, text: 'text-lg', container: 'gap-3' },
  xl: { icon: 52, text: 'text-xl', container: 'gap-3.5' },
}

export default function Logo({
  size = 'md',
  showText = true,
  href,
  className = '',
  textClassName = '',
  subtitle,
}: LogoProps) {
  const { icon, text, container } = sizeMap[size]

  const content = (
    <div className={`flex items-center ${container} ${className} select-none group`}>
      {/* App Logo Icon with Glow */}
      <div
        className="relative flex-shrink-0 rounded-xl overflow-hidden transition-transform duration-200 group-hover:scale-105"
        style={{
          width: icon,
          height: icon,
          boxShadow: '0 0 16px rgba(128, 131, 255, 0.25), 0 2px 6px rgba(0,0,0,0.5)',
        }}
      >
        <Image
          src="/logo.png"
          alt="Wasif's Workspace Logo"
          width={icon * 2}
          height={icon * 2}
          className="w-full h-full object-cover rounded-xl"
          priority
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-tight ${text} ${textClassName}`}
              style={{ color: 'var(--color-on-surface)' }}
            >
              Wasif&apos;s Workspace
            </span>
          </div>
          {subtitle && (
            <span
              className="text-[10px] font-medium tracking-wide uppercase"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    )
  }

  return content
}
