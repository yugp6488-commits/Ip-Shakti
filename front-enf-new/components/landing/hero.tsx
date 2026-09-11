'use client'

import { ArrowRight, Globe2, Landmark } from 'lucide-react'
import { DataStream } from './data-stream'
import { sahayakUIState, useJurisdiction } from './jurisdiction-context'

export function Hero() {
  const { jurisdiction } = useJurisdiction()
  const content = sahayakUIState[jurisdiction]

  return (
    <section id="top" className="relative overflow-hidden px-6 pb-16 pt-36 lg:pt-44">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(80% 50% at 20% 0%, var(--hero-glow-a), transparent 60%), radial-gradient(60% 40% at 90% 20%, var(--hero-glow-b), transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="animate-rise lg:col-span-7">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sage bg-sage/25 px-3.5 py-1.5 text-xs font-semibold text-teak">
              <span className="h-1.5 w-1.5 rounded-full bg-teak" />
              {content.heroTag}
            </span>

            <h1 className="mt-6 font-heading text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-teak text-balance sm:text-5xl lg:text-6xl">
              {content.headline}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-teak-dark/75 text-pretty">
              {content.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/analyze"
                className="group inline-flex items-center gap-2 rounded-full bg-teak px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-xl hover:shadow-teak/25"
              >
                {content.ctaPrimary}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#architecture"
                className="inline-flex items-center gap-2 rounded-full border border-ochre/40 bg-card/50 px-6 py-3.5 text-sm font-semibold text-teak transition-colors hover:bg-card"
              >
                {content.ctaSecondary}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-2" aria-label={`${jurisdiction} capabilities`}>
              {content.badges.map((badge, index) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ochre/30 bg-card/55 px-3 py-1.5 text-xs font-semibold text-teak-dark"
                >
                  {index === 0 ? (
                    jurisdiction === 'domestic' ? <Landmark className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5" />
                  ) : null}
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex -space-x-2" aria-hidden="true">
              {['#8a5f41', '#a77f60', '#ccd67f', '#c98a4b'].map((color) => (
                <span
                  key={color}
                  className="h-8 w-8 rounded-full border-2 border-parchment"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-teak-dark/60">
              Trusted by AYUSH MSMEs, patent attorneys, and state biodiversity boards.
            </p>
          </div>
        </div>

        <div className="animate-rise lg:col-span-5" style={{ animationDelay: '0.15s' }}>
          <DataStream />
        </div>
      </div>
    </section>
  )
}
