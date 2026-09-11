import {
  Search,
  Globe,
  Radar,
  Landmark,
  Languages,
  UserCog,
  Database,
  ShieldCheck,
} from 'lucide-react'

const STEPS = [
  {
    icon: Search,
    title: 'Vehicle Type Inspection',
    desc: 'Product Classifier: Classical vs P&P vs Ayurveda-Aahar vs Cosmetic.',
    data: 'Formulation profile + classification rules',
    security: 'Sanitized intake fields',
  },
  {
    icon: Globe,
    title: 'Border Switch',
    desc: 'Domestic India laws vs International WIPO / Nagoya treaties.',
    data: 'Jurisdiction ruleset + treaty index',
    security: 'Region-aware access controls',
  },
  {
    icon: Radar,
    title: 'TKDL & Section 3(p) Speed Trap Detector',
    desc: 'Real-time prior-art collision check against traditional knowledge.',
    data: 'TKDL + prior-art evidence index',
    security: 'Traceable source citations',
  },
  {
    icon: Landmark,
    title: 'Environmental Toll Booth',
    desc: 'NBA Form I/II auto-generation & cultivation exemptions.',
    data: 'Species + ABS registry records',
    security: 'Consent and provenance checks',
  },
  {
    icon: Languages,
    title: 'Voice & Native RAG',
    desc: 'Bhashini translation in 12 Indian languages with verbatim statutory citations.',
    data: 'Statute corpus + language index',
    security: 'Client data excluded from training',
  },
  {
    icon: UserCog,
    title: 'Human Facilitator Escalation',
    desc: 'Smart routing to registered AYUSH patent agents.',
    data: 'Case log + expert directory',
    security: 'Role-based handoff controls',
  },
]

export function Architecture() {
  return (
    <section id="abs-compliance" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ochre">
            Solution Architecture
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-teak text-balance sm:text-4xl">
            The 6-Step Regulatory Pipeline
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-teak-dark/70">
            Every decision is connected to a named evidence source and a visible security control,
            so teams can review what the engine used and who can access the result.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ochre/25 bg-card/70 px-3 py-1.5 text-xs font-semibold text-teak-dark/75">
              <Database className="h-3.5 w-3.5 text-teak" />
              Evidence-linked database layer
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ochre/25 bg-card/70 px-3 py-1.5 text-xs font-semibold text-teak-dark/75">
              <ShieldCheck className="h-3.5 w-3.5 text-teak" />
              Security and provenance controls
            </span>
          </div>
        </div>

        <ol className="relative mt-14 space-y-4 before:absolute before:left-[27px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-ochre/25">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <li
                key={step.title}
                className="relative flex items-start gap-5 rounded-3xl border border-ochre/20 bg-card/80 p-5 backdrop-blur-sm"
              >
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teak text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ochre">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-teak">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-teak-dark/70">
                    {step.desc}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/25 px-2.5 py-1 text-[11px] font-medium text-teak-dark/75">
                      <Database className="h-3 w-3 text-teak" />
                      {step.data}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-parchment/60 px-2.5 py-1 text-[11px] font-medium text-teak-dark/75">
                      <ShieldCheck className="h-3 w-3 text-teak" />
                      {step.security}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
