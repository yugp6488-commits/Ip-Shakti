import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

type OrbitItem = { label: string; angle: number }

const INNER: OrbitItem[] = [
  { label: 'AYUSH', angle: 0 },
  { label: 'Patent Act 1970', angle: 72 },
  { label: 'Sec 3(p)', angle: 144 },
  { label: 'CDSCO', angle: 216 },
  { label: 'FSSAI', angle: 288 },
]

const OUTER: OrbitItem[] = [
  { label: 'NBA / ABS', angle: 30 },
  { label: 'Biodiversity Act', angle: 90 },
  { label: 'TKDL', angle: 150 },
  { label: 'WIPO', angle: 210 },
  { label: 'GI Registry', angle: 270 },
  { label: 'Ayush Pharmacopoeia', angle: 330 },
]

const INNER_RADIUS = 172
const OUTER_RADIUS = 300

function Ring({
  items,
  radius,
  spin,
  counter,
  variant,
}: {
  items: OrbitItem[]
  radius: number
  spin: string
  counter: string
  variant: 'inner' | 'outer'
}) {
  return (
    <div className={`absolute inset-0 ${spin}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{ transform: `rotate(${item.angle}deg) translateX(${radius}px)` }}
        >
          <div style={{ transform: `rotate(${-item.angle}deg)` }}>
            <div className={counter}>
              <div
                className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-center font-heading font-semibold shadow-[0_10px_30px_rgba(67,48,31,0.12)] ${
                  variant === 'inner'
                    ? 'h-24 w-24 border border-teak/25 bg-teak text-[11px] leading-tight text-primary-foreground'
                    : 'h-[104px] w-[104px] border border-ochre/30 bg-card text-[11px] leading-tight text-teak'
                }`}
              >
                <span className="px-3 text-pretty">{item.label}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PotentialOrbit() {
  return (
    <section id="potential" className="overflow-hidden px-6 py-24">
      <div className="relative mx-auto flex min-h-[620px] max-w-6xl items-center justify-center">
        {/* orbiting constellation */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="relative h-[620px] w-[620px] scale-[0.58] sm:scale-75 lg:scale-100">
            {/* orbit guide rings */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ochre/25"
              style={{ height: INNER_RADIUS * 2, width: INNER_RADIUS * 2 }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ochre/20"
              style={{ height: OUTER_RADIUS * 2, width: OUTER_RADIUS * 2 }}
            />
            <Ring
              items={INNER}
              radius={INNER_RADIUS}
              spin="animate-orbit-fast"
              counter="animate-orbit-reverse-fast"
              variant="inner"
            />
            <Ring
              items={OUTER}
              radius={OUTER_RADIUS}
              spin="animate-orbit"
              counter="animate-orbit-reverse"
              variant="outer"
            />
          </div>
        </div>

        {/* center content */}
        <div className="relative z-10 max-w-md rounded-[2rem] border border-ochre/20 bg-card/80 px-8 py-10 text-center shadow-[0_24px_70px_rgba(67,48,31,0.14)] backdrop-blur-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-sage bg-sage/25 px-3 py-1.5 text-xs font-semibold text-teak">
            <Sparkles className="h-3.5 w-3.5" />
            Regulatory Intelligence Engine
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-teak text-balance sm:text-4xl">
            Know Your Potential
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-teak-dark/70 text-pretty">
            Feed your formulation and extraction method into the Sahayak engine to receive a
            real-time classification, patentability path, and biodiversity clearance across every
            statute it orbits.
          </p>
          <Link
            href="/analyze"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-teak px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Launch the Sahayak Engine
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
