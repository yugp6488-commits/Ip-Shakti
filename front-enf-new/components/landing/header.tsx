'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { LogoMark } from './logo'
import { cn } from '@/lib/utils'
import { useJurisdiction } from './jurisdiction-context'
import { useAuth } from '@/lib/auth-context'

const NAV = ['Engine', 'Database Radar', 'Community', 'Live Sandbox', 'ABS Compliance', 'Docs']

export function Header() {
  const { jurisdiction, setJurisdiction } = useJurisdiction()
  const { user, loading, signOut } = useAuth()

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6">
      <nav
        className="flex h-16 w-full max-w-7xl items-center justify-between gap-3 rounded-full border border-ochre/25 bg-card/70 pl-5 pr-3 shadow-[0_8px_30px_rgba(67,48,31,0.08)] backdrop-blur-xl"
        aria-label="Primary"
      >
        <a href="#top" className="flex shrink-0 items-center gap-2 text-teak">
          <LogoMark className="h-7 w-7" />
          <span className="font-heading text-sm font-extrabold uppercase tracking-tight text-teak">
            IP-SAKTI
          </span>
        </a>

        <ul className="hidden min-w-0 items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium text-teak-dark/70 transition-colors hover:bg-sage/25 hover:text-teak-dark xl:px-3"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center rounded-full border border-ochre/30 bg-parchment/60 p-0.5 text-[11px] font-semibold"
            role="group"
            aria-label="Jurisdiction scope"
          >
            {(['domestic', 'global'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setJurisdiction(option)}
                aria-pressed={jurisdiction === option}
                className={cn(
                  'rounded-full px-2.5 py-1 capitalize transition-colors',
                  jurisdiction === option
                    ? 'bg-teak text-primary-foreground'
                    : 'text-teak-dark/60 hover:text-teak-dark',
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <a
            href="/analyze"
            className="rounded-full bg-teak px-4 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-lg hover:shadow-teak/25"
          >
            Launch Sahayak
          </a>

          {!loading &&
            (user ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-full border border-ochre/30 bg-parchment/60 px-3 py-2 text-[13px] font-semibold text-teak-dark transition-colors hover:bg-parchment"
                title={user.email ?? undefined}
              >
                <span className="max-w-[9rem] truncate">
                  {user.displayName ?? user.email}
                </span>
                <LogOut className="size-3.5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-ochre/30 bg-parchment/60 px-4 py-2.5 text-[13px] font-semibold text-teak-dark transition-colors hover:bg-parchment"
              >
                Sign in
              </Link>
            ))}
        </div>
      </nav>
    </header>
  )
}
