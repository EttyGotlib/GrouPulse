'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) setError('פרטי התחברות שגויים')
    setIsLoading(false)
  }

  async function onGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="bg-[#f7f9fe] text-[#181c1f] min-h-screen flex flex-col items-center font-body" dir="rtl">
      {/* Header */}
      <header className="w-full sticky top-0 bg-[#f7f9fe] z-50">
        <div className="flex flex-row-reverse justify-between items-center px-6 h-16 w-full">
          <div className="font-headline font-black text-[#003643] text-xl">GrouPulse</div>
          <Link href="/" className="flex items-center gap-2 text-[#003643]">
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center w-full px-4 py-12">
        <div className="max-w-4xl w-full flex flex-col md:flex-row-reverse bg-[#f1f4f8] rounded-[2rem] overflow-hidden shadow-sm">
          
          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white md:bg-transparent">
            <div className="mb-10 text-right">
              <h1 className="text-[2.5rem] font-extrabold text-[#003643] mb-2 leading-tight">התחברות</h1>
              <p className="text-[#41484b]">ברוכים הבאים חזרה ל-GrouPulse. התחברו כדי לנהל את המפגשים שלכם.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#003643] mr-1">אימייל או שם משתמש</label>
                <div className="relative">
                  <input 
                    className="w-full bg-[#e5e8ed] border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#a0cdde] outline-none text-right"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@email.com"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#41484b]">alternate_email</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mr-1">
                  <label className="block text-sm font-semibold text-[#003643]">סיסמה</label>
                  <a className="text-xs font-medium text-[#32666d] hover:underline" href="#">שכחת סיסמה?</a>
                </div>
                <div className="relative">
                  <input 
                    className="w-full bg-[#e5e8ed] border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#a0cdde] outline-none text-right"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#41484b]">lock</span>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm text-right font-bold">{error}</div>}

              <button 
                className="w-full bg-[#003643] text-white font-headline font-bold py-4 rounded-xl shadow-lg hover:opacity-95 transition-all"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'מתחבר...' : 'התחברות'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-[#f1f4f8] text-[#41484b]">או</span></div>
            </div>

            <button 
              onClick={onGoogle}
              className="w-full flex items-center justify-center gap-3 bg-[#e0e3e7] text-[#003643] font-headline font-bold py-4 rounded-xl hover:bg-[#e5e8ed] transition-all"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>התחברות באמצעות Google</span>
            </button>
          </div>

          {/* Right Side (Visual) */}
          <div className="hidden md:block w-1/2 relative bg-[#003643] overflow-hidden">
            <div className="relative h-full flex flex-col justify-end p-16 text-right text-white">
              <span className="material-symbols-outlined text-6xl mb-4 text-[#b7ecf3]">verified_user</span>
              <h2 className="text-3xl font-headline font-extrabold leading-snug">המרחב הבטוח שלך לניהול טיפולים קבוצתיים.</h2>
              <div className="flex flex-row-reverse gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                  <span className="material-symbols-outlined mb-1">security</span>
                  <span className="text-[10px] opacity-80">HIPAA Compliant</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                  <span className="material-symbols-outlined mb-1">gavel</span>
                  <span className="text-[10px] opacity-80">GDPR Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Badges */}
      <footer className="w-full max-w-4xl px-6 py-8 flex flex-col items-center gap-6 opacity-60">
        <div className="flex flex-wrap justify-center gap-8 grayscale">
          <div className="flex items-center gap-2 text-xs font-bold"><span className="material-symbols-outlined">health_and_safety</span>HIPAA</div>
          <div className="flex items-center gap-2 text-xs font-bold"><span className="material-symbols-outlined">shield_person</span>GDPR</div>
        </div>
      </footer>
    </div>
  )
}