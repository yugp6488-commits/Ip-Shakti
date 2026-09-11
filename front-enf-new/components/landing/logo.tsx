import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('h-8 w-8', className)}
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 45} 24 24)`}>
            <path d="M24 24C24 16 21 11 24 6C27 11 24 16 24 24Z" />
          </g>
        ))}
        <circle cx="24" cy="24" r="4.5" fill="currentColor" stroke="none" />
        <circle cx="24" cy="24" r="9" strokeWidth="1.2" opacity="0.4" />
      </g>
    </svg>
  )
}
