'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // התחברות עם אימייל וסיסמה
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('פרטי ההתחברות אינם נכונים');
      setLoading(false);
    } else {
      // ניתוב לדף הראשי - וודאי שזה הנתיב שבו נמצא ה-Dashboard שלך
      router.push('/dashboard'); 
      router.refresh();
    }
  };

  // התחברות עם גוגל
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg('שגיאה בהתחברות עם גוגל');
    }
  };

  return (
    <div className="bg-[#f7f9fe] text-[#181c1f] min-h-screen flex flex-col items-center">
      <header className="w-full top-0 sticky bg-[#f7f9fe] z-50">
        <div className="flex flex-row-reverse justify-between items-center px-6 h-16 w-full">
          <div className="font-['Manrope'] font-black text-[#003643] text-xl">GrouPulse</div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center w-full px-4 py-12">
        <div className="max-w-4xl w-full flex flex-col md:flex-row-reverse bg-[#f1f4f8] rounded-[2rem] overflow-hidden shadow-sm">
          
          {/* צד הטופס */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="mb-10 text-right">
              <h1 className="text-[2.5rem] font-extrabold text-[#003643] mb-2 leading-tight">התחברות</h1>
              <p className="text-zinc-600">ברוכים הבאים חזרה ל- GrouPulse. התחברו כדי לנהל את המפגשים.</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2 text-right">
                <label className="block text-sm font-semibold text-[#003643] mr-1">אימייל</label>
                <input 
                  className="w-full bg-[#e5e8ed] border-none rounded-xl px-4 py-3.5 text-right outline-none focus:ring-2 focus:ring-[#a0cdde]"
                  type="email"
                  placeholder="yourname@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 text-right">
                <label className="block text-sm font-semibold text-[#003643] mr-1">סיסמה</label>
                <input 
                  className="w-full bg-[#e5e8ed] border-none rounded-xl px-4 py-3.5 text-right outline-none focus:ring-2 focus:ring-[#a0cdde]"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {errorMsg && <p className="text-red-600 text-sm text-center font-medium">{errorMsg}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#003643] text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? 'מתחבר...' : 'התחברות'}
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs font-medium text-gray-400 uppercase">או</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-semibold text-gray-700">המשך באמצעות Google</span>
              </button>

              <p className="text-center text-sm text-gray-600">
                אין לך חשבון?{' '}
                <Link href="/register" className="text-[#32666d] font-bold hover:underline">
                  הרשמה עכשיו
                </Link>
              </p>
            </form>
          </div>

          {/* צד התמונה/מותג */}
          <div className="hidden md:flex w-1/2 bg-[#003643] items-center justify-center p-12 text-right">
            <div>
              <h2 className="text-3xl font-extrabold text-white leading-snug">המרחב הבטוח שלך לניהול טיפולים קבוצתיים</h2>
              <p className="text-white/70 mt-4">מערכת מאובטחת ומותאמת אישית למנחי קבוצות</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}