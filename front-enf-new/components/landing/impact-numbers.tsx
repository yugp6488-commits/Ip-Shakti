'use client'

import { useEffect, useRef, useState } from 'react'
import { IndianRupee, Clock, TriangleAlert, LayoutGrid } from 'lucide-react'

const METRICS = [
  {
    icon: IndianRupee,
    target: 2.5,
    format: (value: number) => `₹${value.toFixed(1)} Lakhs+`,
    label: 'Average wasted legal spend on unpatentable classical recipe applications.',
  },
  {
    icon: Clock,
    target: 24,
    format: (value: number) => `${Math.round(value * 0.75)}–${Math.round(value)} Months`,
    label: 'Time lost before a First Examination Report (FER) Section 3(p) rejection.',
  },
  {
    icon: TriangleAlert,
    target: 50,
    format: (value: number) => `₹${Math.round(value)} Lakhs`,
    label: 'Maximum penalty for unauthorized wild bio-resource commercialization without ABS clearance.',
  },
  {
    icon: LayoutGrid,
    target: 4,
    format: (value: number) => `${Math.round(value)} Separate Portals`,
    label: 'AYUSH, IP India, FSSAI, and NBA currently navigated in total silos.',
  },
]

function AnimatedMetricValue({
  target,
  format,
  isVisible,
}: {
  target: number
  format: (value: number) => string
  isVisible: boolean
}) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)

    if (!isVisible) {
      setValue(0)
      return
    }

    const startTime = performance.now()
    const duration = 1400
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      setValue(target)
      return
    }

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3
      setValue(target * easedProgress)

      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [isVisible, target])

  return (
    <p
      className="mt-6 min-h-10 font-heading text-3xl font-extrabold tracking-tight text-teak"
      aria-live="polite"
    >
      {format(value)}
    </p>
  )
}

function MetricCard({
  metric,
  index,
}: {
  metric: (typeof METRICS)[number]
  index: number
}) {
  const cardRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = cardRef.current

    if (!element) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(reducedMotion || entry.isIntersecting),
      { threshold: 0.3, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const Icon = metric.icon

  return (
    <article
      ref={cardRef}
      className="rounded-3xl border border-ochre/20 bg-card/80 p-7 shadow-[0_10px_40px_rgba(67,48,31,0.06)] backdrop-blur-sm transition-[opacity,transform,box-shadow] duration-700 ease-out hover:shadow-xl hover:shadow-teak/10"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 30px, 0) scale(0.96)',
        transitionDelay: `${index * 120}ms`,
      }}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage/30 text-teak">
        <Icon className="h-5 w-5" />
      </span>
      <AnimatedMetricValue target={metric.target} format={metric.format} isVisible={isVisible} />
      <p className="mt-3 text-sm leading-relaxed text-teak-dark/70">{metric.label}</p>
    </article>
  )
}

export function ImpactNumbers() {
  return (
    <section id="engine" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mx-auto max-w-2xl text-center font-heading text-3xl font-bold tracking-tight text-teak text-balance sm:text-4xl">
          The High Cost of Blind Regulatory Filings.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric, index) => (
            <MetricCard key={metric.label} metric={metric} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
