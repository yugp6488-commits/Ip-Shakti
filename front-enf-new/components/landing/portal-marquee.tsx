const PORTALS = [
  'India Code',
  'InPASS (IP India)',
  'IMPPAT 2.0',
  'PCIM&H',
  'TKDL',
  'NBA ABS Portal',
  'Open Government Data',
  'NMPB',
  'e-Charak',
  'CDSCO',
  'Ministry of Ayush',
  'FSSAI',
  'WIPO PATENTSCOPE',
  'MTCC',
  'API Setu',
  'Bhashini',
]

export function PortalMarquee() {
  return (
    <section className="overflow-hidden border-y border-ochre/15 bg-card/40 py-8">
      <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-teak-dark/50">
        16 Connected Statutory &amp; Government Portals
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee gap-3">
          {[...PORTALS, ...PORTALS].map((portal, i) => (
            <span
              key={`${portal}-${i}`}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-ochre/25 bg-card px-4 py-2 text-sm font-medium text-teak-dark/70"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sage" />
              {portal}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
