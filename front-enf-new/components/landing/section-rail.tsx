'use client'

import { useEffect, useState } from 'react'

const SECTIONS = [
  { id: 'top', label: 'Start' },
  { id: 'engine', label: 'Evidence' },
  { id: 'database-radar', label: 'People' },
  { id: 'community', label: 'Signals' },
  { id: 'abs-compliance', label: 'Pipeline' },
  { id: 'potential', label: 'Potential' },
]

export function SectionRail() {
  const [activeId, setActiveId] = useState('top')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const updateRail = () => {
      frame = 0
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setProgress(maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0)

      const candidates = SECTIONS.map((section) => {
        const element = document.getElementById(section.id)
        if (!element) return null
        const rect = element.getBoundingClientRect()
        return { id: section.id, distance: Math.abs(rect.top - window.innerHeight * 0.36), rect }
      }).filter((section): section is { id: string; distance: number; rect: DOMRect } => Boolean(section))

      const visible = candidates.filter(({ rect }) => rect.top < window.innerHeight * 0.58 && rect.bottom > window.innerHeight * 0.2)
      const next = (visible.length ? visible : candidates).sort((a, b) => a.distance - b.distance)[0]
      if (next) setActiveId(next.id)
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateRail)
    }

    updateRail()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <nav className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 xl:block" aria-label="Page sections">
      <div className="relative flex flex-col items-end gap-4">
        <span className="absolute right-[3px] top-2 h-[calc(100%-1rem)] w-px bg-teak/20" aria-hidden="true" />
        <span
          className="absolute right-[3px] top-2 w-px origin-top bg-teak transition-transform duration-500 ease-out"
          style={{ height: 'calc(100% - 1rem)', transform: `scaleY(${progress})` }}
          aria-hidden="true"
        />
        {SECTIONS.map((section, index) => {
          const isActive = activeId === section.id
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? 'location' : undefined}
              className="group relative z-10 flex items-center gap-3 text-right"
            >
              <span className={`font-mono text-[10px] tracking-[0.18em] transition-colors ${isActive ? 'text-teak' : 'text-teak-dark/35 group-hover:text-teak'}`}>
                {String(index + 1).padStart(2, '0')} {section.label}
              </span>
              <span className={`h-2 w-2 rounded-full border transition-all duration-300 ${isActive ? 'scale-150 border-teak bg-teak ring-4 ring-teak/15' : 'border-teak/40 bg-background group-hover:border-teak'}`} />
            </a>
          )
        })}
      </div>
    </nav>
  )
}
