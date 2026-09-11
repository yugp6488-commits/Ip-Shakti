import { Rocket, Sprout, FlaskConical, Scale } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'

const PERSONAS = [
  {
    icon: Rocket,
    tag: 'Startups',
    title: 'Ayurvedic Startups & MSMEs',
    outcome: 'Avoid food vs drug mislabeling product seizures.',
  },
  {
    icon: Sprout,
    tag: 'Healers',
    title: 'Traditional Vaidyas & Healers',
    outcome: 'Protect formulations from global biopiracy.',
  },
  {
    icon: FlaskConical,
    tag: 'Research',
    title: 'Phytopharmaceutical Researchers',
    outcome: 'Patent extraction processes, not classical recipes.',
  },
  {
    icon: Scale,
    tag: 'Legal',
    title: 'Legal Facilitators & IP Attorneys',
    outcome: 'Zero-hallucination statutory citations & automated form drafting.',
  },
]

export function Personas() {
  return (
    <section id="database-radar" className="relative overflow-hidden border-y border-ochre/15 px-6 py-24 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-sage/20 blur-3xl" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-ochre">
              01 / The people in the loop
            </p>
            <h2 className="mt-4 max-w-xl font-heading text-4xl font-extrabold tracking-tight text-teak text-balance sm:text-5xl">
              Who IP-SAKTI Is Built For
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-teak-dark/65 lg:justify-self-end">
            One evidence layer for the people who formulate, file, classify, clear, and defend Indian traditional knowledge.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PERSONAS.map((p, index) => {
            const Icon = p.icon
            return (
              <ScrollReveal key={p.title} delay={index * 0.08}>
                <article className="group relative flex min-h-64 flex-col overflow-hidden rounded-[2rem] border border-ochre/20 bg-card p-7 shadow-[0_18px_50px_rgba(67,48,31,0.06)] transition-all duration-500 hover:-translate-y-1 hover:border-teak/40 hover:shadow-xl hover:shadow-teak/10">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-semibold tracking-[0.2em] text-ochre">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="rounded-full border border-ochre/30 bg-parchment/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-teak-dark/60">
                      {p.tag}
                    </span>
                  </div>
                  <span className="mt-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-teak text-primary-foreground transition-transform duration-500 group-hover:rotate-6">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 max-w-xs font-heading text-xl font-bold leading-snug text-teak">
                    {p.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-teak-dark/70">
                    {p.outcome}
                  </p>
                  <span className="pointer-events-none absolute -bottom-8 -right-4 font-heading text-[9rem] font-extrabold leading-none text-teak/[0.045]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </article>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
