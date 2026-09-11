import { LogoMark } from './logo'

type FooterLink = { label: string; href?: string }

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Regulatory Frameworks',
    links: [
      { label: 'Section 3(p) Patent Act' },
      { label: 'Drugs & Cosmetics Act' },
      { label: 'Ayurveda-Aahar Rules' },
      { label: 'Phytopharma Guidelines' },
    ],
  },
  {
    title: 'National Portals',
    links: [
      { label: 'Ministry of Ayush', href: 'https://ayush.gov.in/' },
      { label: 'IP India (InPASS)', href: 'https://ipindia.gov.in/' },
      { label: 'NBA ABS Portal', href: 'https://absefiling.nbaindia.in/' },
      { label: 'FSSAI', href: 'https://www.fssai.gov.in/' },
      { label: 'CDSCO', href: 'https://cdsco.gov.in/' },
      { label: 'TKDL', href: 'https://www.tkdl.res.in/' },
    ],
  },
  {
    title: 'Global Treaties',
    links: [
      { label: 'WIPO PATENTSCOPE' },
      { label: 'Nagoya Protocol' },
      { label: 'CBD Framework' },
      { label: 'PCT Filing' },
    ],
  },
  {
    title: 'Support & API',
    links: [
      { label: 'API Setu' },
      { label: 'Bhashini Voice' },
      { label: 'Developer Docs' },
      { label: 'Contact Facilitators' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="px-4 pb-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-ink p-10 text-parchment lg:p-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 text-sage">
              <LogoMark className="h-8 w-8" />
              <span className="font-heading text-lg font-extrabold uppercase tracking-tight text-parchment">
                IP-SAKTI
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-parchment/60">
              The AI-powered Ayush regulatory & IPR copilot. Turning ancient formulations
              into protected global innovations.
            </p>
            <p className="mt-6 max-w-xs rounded-xl border border-parchment/15 bg-parchment/5 px-4 py-3 text-[11px] leading-relaxed text-parchment/50">
              Disclaimer: IP-SAKTI Sahayak provides regulatory guidance and statutory
              references only. It does not constitute legal advice. Consult a registered
              patent agent before filing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-heading text-sm font-bold text-parchment">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href ?? '#'}
                        {...(link.href
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="text-sm text-parchment/55 transition-colors hover:text-sage"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-parchment/15 pt-6 text-xs text-parchment/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 IP-SAKTI Sahayak. All rights reserved.</p>
          <p>Aligned with the Ministry of Ayush &amp; All India Institute of Ayurveda (AIIA).</p>
        </div>
      </div>
    </footer>
  )
}
