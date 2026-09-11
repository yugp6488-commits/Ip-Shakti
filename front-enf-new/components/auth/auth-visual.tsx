'use client'

import { motion } from 'framer-motion'
import { LogoMark } from '@/components/landing/logo'

const FLOATING_TERMS = [
  { label: 'Section 3(p)', top: '18%', left: '12%', delay: 0 },
  { label: 'NBA / ABS', top: '68%', left: '8%', delay: 0.6 },
  { label: 'TKDL', top: '30%', left: '78%', delay: 1.1 },
  { label: 'CDSCO', top: '76%', left: '70%', delay: 0.35 },
  { label: 'FSSAI', top: '50%', left: '86%', delay: 1.5 },
]

export function AuthVisual() {
  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-teak lg:block">
      {/* ambient glow, matches the landing hero's radial gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 55% at 20% 15%, rgba(212,181,138,0.35), transparent 60%), radial-gradient(60% 45% at 85% 85%, rgba(244,233,213,0.18), transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* slowly rotating orbit rings, echoing the landing page's constellation */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <motion.div
          className="h-[520px] w-[520px] rounded-full border border-dashed border-parchment/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-parchment/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* drifting regulatory-body labels */}
      {FLOATING_TERMS.map((term) => (
        <motion.div
          key={term.label}
          className="absolute rounded-full border border-parchment/25 bg-parchment/10 px-3.5 py-1.5 text-[11px] font-semibold text-parchment/80 backdrop-blur-sm"
          style={{ top: term.top, left: term.left }}
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: term.delay,
          }}
        >
          {term.label}
        </motion.div>
      ))}

      {/* central content */}
      <div className="relative flex h-full flex-col items-start justify-between p-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-parchment"
        >
          <LogoMark className="h-8 w-8" />
          <span className="font-heading text-sm font-extrabold uppercase tracking-tight">
            IP-SAKTI
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-sm"
        >
          <h2 className="font-heading text-3xl font-extrabold leading-tight text-parchment text-balance">
            The zero-hallucination regulatory GPS for Ayurveda.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-parchment/70 text-pretty">
            Sign in to pick up your compliance workspace, saved Section 3(p) drafts, and
            biodiversity clearance tracker right where you left off.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
