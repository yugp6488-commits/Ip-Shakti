import type { Metadata } from 'next'
import { Analyzer } from '@/components/analyze/analyzer'

export const metadata: Metadata = {
  title: 'Sahayak Engine — Live Regulatory Analysis',
  description:
    'Add your formulation and extraction method to receive a real-time regulatory classification, patentability path, and biodiversity clearance.',
}

export default function AnalyzePage() {
  return <Analyzer />
}
