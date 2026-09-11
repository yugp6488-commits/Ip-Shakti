import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthVisual } from '@/components/auth/auth-visual'
import { LogoMark } from '@/components/landing/logo'

export const metadata: Metadata = {
  title: 'Sign in — IP-SAKTI Sahayak',
  description: 'Sign in to your IP-SAKTI Sahayak compliance workspace.',
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Link
          href="/"
          className="flex items-center gap-2 text-teak lg:hidden"
        >
          <LogoMark className="h-7 w-7" />
          <span className="font-heading text-sm font-extrabold uppercase tracking-tight">
            IP-SAKTI
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <AuthForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to IP-SAKTI Sahayak&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>

      <AuthVisual />
    </main>
  )
}
