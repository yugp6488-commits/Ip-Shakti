import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { TankBackground } from '@/components/scroll/tank-background'
import { DiveSection } from '@/components/scroll/dive-section'
import { PortalMarquee } from '@/components/landing/portal-marquee'
import { ImpactNumbers } from '@/components/landing/impact-numbers'
import { Personas } from '@/components/landing/personas'
import { Architecture } from '@/components/landing/architecture'
import { PotentialOrbit } from '@/components/landing/potential-orbit'
import { Footer } from '@/components/landing/footer'
import { JurisdictionProvider } from '@/components/landing/jurisdiction-context'
import { Community } from '@/components/landing/community'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { SectionRail } from '@/components/landing/section-rail'

export default function Page() {
  return (
    <JurisdictionProvider>
      <main className="min-h-screen bg-background">
        <TankBackground />
        <SectionRail />
        <Header />
        <Hero />
        <DiveSection />
        <ScrollReveal>
          <PortalMarquee />
        </ScrollReveal>
        <ScrollReveal delay={0.06} direction="left">
          <ImpactNumbers />
        </ScrollReveal>
        <ScrollReveal delay={0.1} direction="right">
          <Personas />
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <Community />
        </ScrollReveal>
        <ScrollReveal delay={0.1} direction="left">
          <Architecture />
        </ScrollReveal>
        <ScrollReveal delay={0.08} direction="right">
          <PotentialOrbit />
        </ScrollReveal>
        <ScrollReveal delay={0.06}>
          <Footer />
        </ScrollReveal>
      </main>
    </JurisdictionProvider>
  )
}
