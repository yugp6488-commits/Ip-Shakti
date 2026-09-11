'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type ScrollRevealProps = {
    children: ReactNode
    delay?: number
    className?: string
    direction?: 'up' | 'left' | 'right'
}

const offsets = {
    up: { x: 0, y: 34 },
    left: { x: -34, y: 0 },
    right: { x: 34, y: 0 },
}

export function ScrollReveal({
    children,
    delay = 0,
    className,
    direction = 'up',
}: ScrollRevealProps) {
    const offset = offsets[direction]
    const elementRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const element = elementRef.current

        if (!element) return

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(reducedMotion || entry.isIntersecting),
            { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    return (
        <div
            ref={elementRef}
            className={className}
            data-scroll-reveal={isVisible ? 'visible' : 'hidden'}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate3d(0, 0, 0)' : `translate3d(${offset.x}px, ${offset.y}px, 0)`,
                transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
            }}
        >
            {children}
        </div>
    )
}
