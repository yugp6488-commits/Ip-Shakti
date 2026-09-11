import { Leaf, FlaskConical, ShieldCheck, Sprout } from 'lucide-react'

const PATHS = [
  { icon: Leaf, label: 'AYUSH P&P Drug', top: '6%', accent: 'var(--sage)' },
  { icon: FlaskConical, label: 'Process Patent', top: '42%', accent: 'var(--teak)' },
  { icon: ShieldCheck, label: 'NBA Form I', top: '78%', accent: 'var(--ochre)' },
]

const PARTICLES = [
  { left: '18%', delay: '0s', size: 5 },
  { left: '34%', delay: '1.4s', size: 3.5 },
  { left: '52%', delay: '2.6s', size: 6 },
  { left: '68%', delay: '0.8s', size: 4 },
  { left: '82%', delay: '3.4s', size: 3 },
]

const INNER_RING_POINTS = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * Math.PI) / 3
  return {
    cx: Number((Math.cos(angle) * 20).toFixed(6)),
    cy: Number((Math.sin(angle) * 20).toFixed(6)),
  }
})

export function DataStream() {
  return (
    <div className="relative aspect-square w-full">
      {/* pulsing herbal glow, layered */}
      <div
        className="animate-glow-pulse absolute inset-0 rounded-[2rem]"
        style={{
          background:
            'radial-gradient(55% 55% at 42% 38%, rgba(204,214,127,0.32), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="animate-glow-pulse absolute inset-0 rounded-[2rem]"
        style={{
          background:
            'radial-gradient(45% 45% at 62% 68%, rgba(201,138,75,0.22), transparent 70%)',
          animationDelay: '-3s',
        }}
        aria-hidden="true"
      />

      {/* rising herbal particles */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem]" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="animate-particle absolute bottom-8 rounded-full bg-sage/70"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Ayurveda mandala: dosha rings + lotus + growing vine */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a7b86a" />
            <stop offset="100%" stopColor="#8a5f41" />
          </linearGradient>
          <linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ccd67f" />
            <stop offset="100%" stopColor="#8a5f41" />
          </linearGradient>
        </defs>

        {/* outer tridosha ring (Vata / Pitta / Kapha) - slow rotation */}
        <g className="animate-orbit" style={{ transformOrigin: '200px 200px' }} opacity="0.6">
          <circle cx="200" cy="200" r="150" fill="none" stroke="var(--sage)" strokeWidth="1" strokeDasharray="2 10" />
          <path d="M 200 50 A 150 150 0 0 1 330 275" fill="none" stroke="var(--sage)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 330 275 A 150 150 0 0 1 70 275" fill="none" stroke="var(--ochre)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 70 275 A 150 150 0 0 1 200 50" fill="none" stroke="var(--teak)" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* inner sacred-geometry ring - counter rotation */}
        <g
          className="animate-orbit-reverse-fast"
          style={{ transformOrigin: '200px 200px' }}
          transform="translate(200 200)"
          stroke="#c98a4b"
          strokeWidth="0.9"
          fill="none"
          opacity="0.5"
        >
          {INNER_RING_POINTS.map((point, i) => (
            <circle key={i} cx={point.cx} cy={point.cy} r="20" />
          ))}
          <circle cx="0" cy="0" r="20" />
        </g>

        {/* breathing lotus / tulsi leaf at center */}
        <g className="animate-breathe" style={{ transformOrigin: '200px 200px' }} transform="translate(130 110)" opacity="0.92">
          <path
            d="M70 10 C 20 55, 5 145, 70 200 C 135 145, 120 55, 70 10 Z"
            fill="url(#leafGrad)"
            opacity="0.3"
          />
          <path
            d="M70 10 C 20 55, 5 145, 70 200 C 135 145, 120 55, 70 10 Z"
            fill="none"
            stroke="#8a5f41"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <path d="M67 24 L 62 188" stroke="#8a5f41" strokeWidth="1" opacity="0.45" />
          {[45, 78, 110, 142, 168].map((y, i) => (
            <g key={i} stroke="#8a5f41" strokeWidth="0.8" opacity="0.35">
              <path d={`M64 ${y} C 44 ${y + 6}, 30 ${y + 16}, 20 ${y + 26}`} fill="none" />
              <path d={`M66 ${y} C 86 ${y + 6}, 100 ${y + 16}, 110 ${y + 26}`} fill="none" />
            </g>
          ))}
        </g>

        {/* lotus petals blooming beneath, gentle sway */}
        <g className="animate-petal-sway" opacity="0.85">
          {[-1, 0, 1].map((offset) => (
            <path
              key={offset}
              d={`M${200 + offset * 26} 300 C ${185 + offset * 26} 270, ${185 + offset * 26} 250, ${200 + offset * 26} 235 C ${215 + offset * 26} 250, ${215 + offset * 26} 270, ${200 + offset * 26} 300 Z`}
              fill="url(#petalGrad)"
              opacity={offset === 0 ? 0.55 : 0.35}
            />
          ))}
        </g>

        {/* growing vine tendril that blooms and fades on loop */}
        <path
          className="animate-vine-grow"
          d="M40 340 C 90 320, 110 280, 95 240 C 80 200, 130 190, 150 155"
          fill="none"
          stroke="var(--sage)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* floating output pathway cards */}
      {PATHS.map((p, i) => {
        const Icon = p.icon
        return (
          <div
            key={p.label}
            className="animate-float absolute right-0 flex items-center gap-2 rounded-xl border border-ochre/25 bg-card/85 px-3 py-2 shadow-lg backdrop-blur-md"
            style={{ top: p.top, animationDelay: `${i * 0.6}s` }}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: p.accent, color: '#2e2218' }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold text-teak-dark">
              {p.label}
            </span>
          </div>
        )
      })}

      {/* small sprout badge, bottom-left accent */}
      <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full border border-sage/40 bg-sage/20 backdrop-blur-md">
        <Sprout className="h-4.5 w-4.5 text-teak" />
      </div>
    </div>
  )
}
