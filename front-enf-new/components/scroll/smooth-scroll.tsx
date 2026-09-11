'use client'

import { ReactLenis, useLenis } from '@studio-freight/react-lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, type ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger)

interface SmoothScrollProps {
  children: ReactNode
}

/**
 * Global smooth-scroll provider. Wraps the app in a Lenis root instance and
 * keeps GSAP's ScrollTrigger in lockstep with Lenis's own rAF loop so pinned /
 * scrubbed animations never stutter or desync from the visual scroll position.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenis = useLenis(ScrollTrigger.update)

  useEffect(() => {
    // Drive Lenis from GSAP's ticker instead of its own rAF loop, so both
    // stay perfectly in sync.
    const update = (time: number) => {
      lenis?.raf(time * 1000)
    }

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
    }
  }, [lenis])

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.05,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
