'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { ArrowRight, Lock, Mail } from 'lucide-react'

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.254 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691 12.879 19.51C14.656 15.108 18.962 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.268 4 24 4 16.318 4 9.656 8.34 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.166 35.091 26.7 36 24 36c-5.233 0-9.62-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.57l.003-.002 6.19 5.238C36.973 39.209 44 34 44 24c0-1.341-.138-2.651-.389-3.917Z"
      />
    </svg>
  )
}

function ComplianceBadge({
  label,
  icon,
}: {
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-[11px] tracking-[0.28em] text-slate-500">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 shadow-sm ring-1 ring-slate-200/70">
        {icon}
      </span>
      <span className="uppercase">{label}</span>
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.length >= 6 && !isLoading,
    [email, password, isLoading]
  )

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) throw signInError
      // Routing/redirect can be added once the post-login destination is defined.
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'אירעה שגיאה. נסו שוב בעוד רגע.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function onGoogle() {
    setError(null)
    setIsLoading(true)
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (oauthError) throw oauthError
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'אירעה שגיאה. נסו שוב בעוד רגע.'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50"
    >
      <header className="mx-auto flex max-w-md items-center justify-between px-6 pt-8">
        <div className="text-lg font-semibold tracking-tight text-slate-900">
          GrouPulse
        </div>
        <Link
          href="/"
          aria-label="חזרה"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-md flex-col px-6 pb-10 pt-6">
        <section className="rounded-3xl bg-white/70 p-7 shadow-sm ring-1 ring-slate-200/60 backdrop-blur">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
            התחברות
          </h1>
          <p className="mt-3 text-center text-sm leading-6 text-slate-600">
            ברוכים הבאים חזרה ל‑GrouPulse. התחברו כדי לנהל את המפגשים שלכם.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                אימייל או שם משתמש
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="yourname@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-slate-50/80 px-4 pl-12 text-sm text-slate-900 shadow-inner ring-1 ring-slate-200/70 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  סיסמה
                </label>
                <Link
                  href="/(auth)/forgot-password"
                  className="text-sm text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
                >
                  שכחת סיסמה?
                </Link>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-2xl bg-slate-50/80 px-4 pl-12 text-sm text-slate-900 shadow-inner ring-1 ring-slate-200/70 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className={classNames(
                'h-12 w-full rounded-2xl bg-slate-800 text-sm font-semibold text-white shadow-sm transition',
                'hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500',
                (!canSubmit || isLoading) &&
                  'cursor-not-allowed bg-slate-400 hover:bg-slate-400'
              )}
            >
              {isLoading ? 'מתחבר…' : 'התחברות'}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <div className="relative flex justify-center">
                <span className="rounded-full bg-white/70 px-4 text-sm text-slate-500">
                  או
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoogle}
              disabled={isLoading}
              className={classNames(
                'h-12 w-full rounded-2xl bg-white text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition',
                'hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400',
                isLoading && 'cursor-not-allowed opacity-70'
              )}
            >
              <span className="flex items-center justify-center gap-3">
                <GoogleIcon className="h-5 w-5" />
                התחברות באמצעות Google
              </span>
            </button>

            <p className="pt-1 text-center text-sm text-slate-600">
              עדיין אין לך חשבון?{' '}
              <Link
                href="/(auth)/signup"
                className="font-medium text-slate-800 underline-offset-4 hover:underline"
              >
                הרשמה
              </Link>
            </p>
          </form>
        </section>

        <section className="mt-auto pt-10">
          <div className="flex items-center justify-center gap-10">
            <ComplianceBadge
              label="HIPAA COMPLIANT"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-slate-600"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 2 4.5 5.5v6.1c0 5 3.2 9.6 7.5 10.9 4.3-1.3 7.5-5.9 7.5-10.9V5.5L12 2Zm0 18.3c-3-1.2-5.2-4.6-5.2-8.2V7l5.2-2.4L17.2 7v5.1c0 3.6-2.2 7-5.2 8.2Z"
                  />
                  <path
                    fill="currentColor"
                    d="m10.7 12.8-1.5-1.5-1.1 1.1 2.6 2.6 5.2-5.2-1.1-1.1-4.1 4.1Z"
                  />
                </svg>
              }
            />
            <ComplianceBadge
              label="GDPR COMPLIANT"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-slate-600"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 3c-4.4 0-8 3.6-8 8v4c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4v-4c0-4.4-3.6-8-8-8Zm0 2c3.3 0 6 2.7 6 6v4c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-4c0-3.3 2.7-6 6-6Z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 10a2.5 2.5 0 0 0-1 4.8V17h2v-2.2A2.5 2.5 0 0 0 12 10Z"
                  />
                </svg>
              }
            />
          </div>
        </section>
      </main>
    </div>
  )
}

