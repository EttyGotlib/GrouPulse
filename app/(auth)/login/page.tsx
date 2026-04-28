'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // התחברות עם אימייל וסיסמה
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('פרטי ההתחברות אינם נכונים');
      setLoading(false);
    } else {
      router.push('/dashboard'); 
      router.refresh();
    }
  };

 
  // פונקציה לשליחת מייל שחזור סיסמה
  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('אנא הזינו אימייל כדי לקבל קישור לאיפוס סיסמה');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setErrorMsg('שגיאה בשליחת מייל השחזור: ' + error.message);
    } else {
      setSuccessMsg('מייל לאיפוס סיסמה נשלח לתיבת הדואר שלך');
    }
    setLoading(false);
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
                <div className="flex justify-between items-center mb-1">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-[#32666d] hover:underline"
                  >
                    שכחת סיסמה?
                  </button>
                  <label className="block text-sm font-semibold text-[#003643] mr-1">סיסמה</label>
                </div>
                <input 
                  className="w-full bg-[#e5e8ed] border-none rounded-xl px-4 py-3.5 text-right outline-none focus:ring-2 focus:ring-[#a0cdde]"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {errorMsg && <p className="text-red-600 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{errorMsg}</p>}
              {successMsg && <p className="text-green-600 text-sm text-center font-medium bg-green-50 p-2 rounded-lg">{successMsg}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#003643] text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? 'מתחבר...' : 'התחברות'}
              </button>

              
              {/* קישור להרשמה שהוחזר */}
              <p className="text-center text-sm text-gray-600">
                אין לך חשבון?{' '}
                <Link href="/register" className="text-[#32666d] font-bold hover:underline">
                  הרשמה עכשיו
                </Link>
              </p>
            </form>
          </div>

          {/* צד המותג */}
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