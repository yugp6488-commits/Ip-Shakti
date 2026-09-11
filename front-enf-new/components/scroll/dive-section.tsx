'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { LogoMark } from '@/components/landing/logo'

gsap.registerPlugin(ScrollTrigger)

/**
 * Pins a full-viewport section and, as the user scrolls through it, scales
 * the round logo mark up massively while spinning and fading it out — the
 * illusion of "diving" through the logo into the Tank behind it.
 */
export function DiveSection() {
  const containerRef = useRef<HTMLElement | null>(null)
  const logoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(logoRef.current, {
        scale: 15, // massive zoom
        rotate: 360, // full spin as it dives
        opacity: 0, // fade out as you pass through
        ease: 'power2.in',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=1500', // how long the scroll lasts (1500px)
          scrub: 1, // 1s lag for buttery smoothness
          pin: true, // lock the screen in place while animating
        },
      })
    }, containerRef)

    return () => ctx.revert() // cleanup on unmount
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative z-10 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <div
        ref={logoRef}
        className="flex h-36 w-36 items-center justify-center rounded-full border border-teak/30 bg-teak/10 shadow-[0_0_80px_rgba(138,90,59,0.25)] backdrop-blur-sm will-change-transform sm:h-48 sm:w-48"
      >
        <LogoMark className="h-16 w-16 text-teak sm:h-20 sm:w-20" />
      </div>
    </section>
  )
}
