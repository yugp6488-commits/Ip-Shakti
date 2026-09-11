import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'
import { SmoothScroll } from '@/components/scroll/smooth-scroll'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'IP-SAKTI Sahayak — AI Ayush Regulatory & IPR Copilot',
  description:
    'The zero-hallucination regulatory GPS for Ayurveda. Prevent Section 3(p) patent rejections, classify Drugs vs Ayurveda-Aahar, and automate NBA biodiversity clearances. Aligned with the Ministry of Ayush & AIIA.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f3e4c9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <SmoothScroll>
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </SmoothScroll>
        </AuthProvider>
      </body>
    </html>
  )
}
