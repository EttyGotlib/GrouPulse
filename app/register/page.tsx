'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [practiceType, setPracticeType] = useState<'private' | 'institution'>('private');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // או שם המוסד
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          practice_type: practiceType,
        },
      },
    });

    if (error) {
      setErrorMsg('חלה שגיאה בתהליך ההרשמה. נסו שוב.');
      setLoading(false);
    } else {
      alert('ההרשמה הצליחה! כעת ניתן להתחבר.');
      router.push('/login');
    }
  };

  return (
    <div className="bg-[#f7f9fe] min-h-screen flex flex-col items-center">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex flex-row-reverse items-center justify-between px-6 h-16 max-w-7xl mx-auto w-full">
          <div className="font-['Manrope'] font-black text-2xl text-[#003643]">GrouPulse</div>
          <Link href="/login" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
             <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 w-full max-w-md">
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl font-bold text-[#003643] tracking-tight">יצירת חשבון חדש</h1>
          <p className="text-gray-600 text-lg">הצטרפו לקהילת GrouPulse ונהלו את המערך שלכם בחכמה</p>
        </div>

        {/* בחירת סוג מנחה */}
        <div className="bg-gray-200 p-1 rounded-2xl flex mb-8">
          <button 
            onClick={() => setPracticeType('private')}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${practiceType === 'private' ? 'bg-white text-[#003643] shadow-sm' : 'text-gray-500'}`}
          >
            מטפל עצמאי
          </button>
          <button 
            onClick={() => setPracticeType('institution')}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${practiceType === 'institution' ? 'bg-white text-[#003643] shadow-sm' : 'text-gray-500'}`}
          >
            מוסד / מכון
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-1.5 text-right">
            <label className="text-sm font-medium text-gray-700 px-1">
              {practiceType === 'private' ? 'שם מלא' : 'שם המוסד / המכון'}
            </label>
            <input 
              className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#a0cdde] text-right outline-none"
              placeholder={practiceType === 'private' ? 'ישראל ישראלי' : 'מרכז רפואי...'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-sm font-medium text-gray-700 px-1">כתובת אימייל</label>
            <input 
              className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#a0cdde] text-right outline-none"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-sm font-medium text-gray-700 px-1">סיסמה</label>
            <input 
              className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#a0cdde] text-right outline-none"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && <p className="text-red-600 text-sm text-center">{errorMsg}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#003643] text-white font-bold py-5 rounded-2xl shadow-lg hover:opacity-95 transition-all disabled:opacity-50 text-lg"
          >
            {loading ? 'יוצר חשבון...' : 'יצירת חשבון'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-8">
          כבר יש לכם חשבון? <Link href="/login" className="text-[#32666d] font-bold hover:underline">התחברו כאן</Link>
        </p>
      </main>
    </div>
  );
}