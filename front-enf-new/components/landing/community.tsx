import { ScrollReveal } from './scroll-reveal'

const SYSTEM_SIGNALS = [
    {
        name: 'Fragmented compliance portals',
        role: 'Current system problem',
        initials: '01',
        quote:
            'AYUSH, IP India, FSSAI, TKDL, and NBA information sits across separate portals, forcing teams to repeat the same research and manually connect the evidence.',
    },
    {
        name: 'Section 3(p) rejection risk',
        role: 'Patent filing gap',
        initials: '02',
        quote:
            'Classical Ayurvedic knowledge can be filed as an invention without enough novelty analysis, creating expensive prosecution cycles and avoidable First Examination Report rejections.',
    },
    {
        name: 'Unclear product classification',
        role: 'Regulatory ambiguity',
        initials: '03',
        quote:
            'Teams struggle to determine whether a product belongs under Drugs, Ayurveda-Aahar, food, or another route before labels and claims are already in production.',
    },
    {
        name: 'Biodiversity clearance delays',
        role: 'ABS compliance gap',
        initials: '04',
        quote:
            'NBA Form I and Form III obligations often appear late in the workflow, when missing source, benefit-sharing, or access records can delay commercialization and foreign filing.',
    },
    {
        name: 'Traditional knowledge exposure',
        role: 'Protection weakness',
        initials: '05',
        quote:
            'Without a clear TKDL and country-of-origin disclosure trail, valuable traditional knowledge can be exposed to biopiracy or challenged during international examination.',
    },
    {
        name: 'PCT timeline blind spots',
        role: 'Global filing pressure',
        initials: '06',
        quote:
            'A 30-month national-phase window moves quickly. Teams need one view of deadlines, disclosure duties, and foreign clearance status before a market decision becomes irreversible.',
    },
    {
        name: 'Evidence scattered across teams',
        role: 'Operational friction',
        initials: '07',
        quote:
            'Formulation notes, prior-art evidence, botanical sources, and legal opinions are rarely assembled in one reviewable record, slowing every handoff from science to counsel.',
    },
    {
        name: 'High cost of late correction',
        role: 'System-wide consequence',
        initials: '08',
        quote:
            'When a classification, disclosure, or clearance issue is found after filing, teams lose months and spend more correcting the path than they would have spent validating it upfront.',
    },
]

export function Community() {
    return (
    <section id="community" className="border-y border-ochre/15 bg-teak/[0.035] px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-ochre">
              02 / The friction before filing
            </p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-teak text-balance sm:text-5xl">
              What the system says.
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-teak-dark/65 lg:text-right">
            Eight signals teams keep rediscovering—scattered across portals, people, and deadlines.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {SYSTEM_SIGNALS.map((signal, index) => (
            <ScrollReveal key={signal.name} delay={(index % 4) * 0.07} direction={index % 2 === 0 ? 'up' : 'right'}>
              <article className={`group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-[1.75rem] border p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-teak/10 ${index === 0 || index === 5 ? 'border-teak/20 bg-teak text-primary-foreground' : 'border-ochre/20 bg-card'}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-mono text-xs font-semibold tracking-[0.2em] ${index === 0 || index === 5 ? 'text-primary-foreground/55' : 'text-ochre'}`}>
                    {signal.initials}
                  </span>
                  <span className={`h-2 w-2 rounded-full ${index === 0 || index === 5 ? 'bg-sage' : 'bg-ochre/60'}`} />
                </div>
                <div className="mt-12">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${index === 0 || index === 5 ? 'text-primary-foreground/60' : 'text-ochre'}`}>
                    {signal.role}
                  </p>
                  <h3 className={`mt-3 font-heading text-xl font-bold leading-tight ${index === 0 || index === 5 ? 'text-primary-foreground' : 'text-teak'}`}>
                    {signal.name}
                  </h3>
                  <p className={`mt-4 text-sm leading-relaxed ${index === 0 || index === 5 ? 'text-primary-foreground/75' : 'text-teak-dark/70'}`}>
                    {signal.quote}
                  </p>
                </div>
                <span className={`absolute -bottom-8 -right-2 font-heading text-[8rem] font-extrabold leading-none transition-transform duration-500 group-hover:scale-110 ${index === 0 || index === 5 ? 'text-primary-foreground/[0.06]' : 'text-teak/[0.05]'}`} aria-hidden="true">
                  {signal.initials}
                </span>
              </article>
            </ScrollReveal>
          ))}
                </div>
            </div>
        </section>
    )
}
