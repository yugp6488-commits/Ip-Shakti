'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export const sahayakUIState = {
    domestic: {
        heroTag: 'Problem Statement 26045 • Ministry of Ayush & AIIA Approved',
        headline: 'Turn Ancient Ayurvedic Formulations Into Protected Global Innovations.',
        subtitle:
            'The zero-hallucination regulatory GPS that prevents Section 3(p) patent rejections, classifies products between Drugs and Ayurveda-Aahar, and automates NBA Form I biodiversity clearances.',
        badges: ['AYUSH P&P Drug', 'Process Patent', 'NBA Form I'],
        ctaPrimary: 'Analyze Your Formulation Free →',
        ctaSecondary: 'View Legal Pipeline →',
    },
    global: {
        heroTag: 'WIPO 2024 GRATK Treaty & PCT International Compliance',
        headline: 'Scale Traditional Knowledge to Global Patent Markets Securely.',
        subtitle:
            'Track 30-month PCT national phase timelines, generate mandatory WIPO country-of-origin disclosures to prevent biopiracy, and secure NBA Form III foreign filing clearances.',
        badges: ['PCT Target (30m)', 'WIPO GRATK Treaty', 'NBA Form III'],
        ctaPrimary: 'Run Global IP Risk Check →',
        ctaSecondary: 'View TKDL Guardrails →',
    },
} as const

type Jurisdiction = keyof typeof sahayakUIState

type JurisdictionContextValue = {
    jurisdiction: Jurisdiction
    setJurisdiction: (jurisdiction: Jurisdiction) => void
}

const JurisdictionContext = createContext<JurisdictionContextValue | null>(null)

export function JurisdictionProvider({ children }: { children: ReactNode }) {
    const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('domestic')

    return (
        <JurisdictionContext.Provider value={{ jurisdiction, setJurisdiction }}>
            <div data-jurisdiction={jurisdiction}>{children}</div>
        </JurisdictionContext.Provider>
    )
}

export function useJurisdiction() {
    const context = useContext(JurisdictionContext)

    if (!context) {
        throw new Error('useJurisdiction must be used inside JurisdictionProvider')
    }

    return context
}
