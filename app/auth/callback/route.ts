import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
        // הגדרות אלו עוקפות בעיות של תווים מיוחדים (כמו עברית) בשם המשתמש
        auth: {
          storageKey: 'grouppulse-auth-token',
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    } else {
      console.error("Auth Exchange Error:", error.message)
    }
  }

  // חזרה לדף התחברות עם הודעת שגיאה במקרה של כישלון
  return NextResponse.redirect(`${origin}/login?message=auth_failed_in_callback`)
}