'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [practiceType, setPracticeType] = useState<'private' | 'institution'>('private');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [institutionCode, setInstitutionCode] = useState(''); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generateRandomCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); 
    return `INST-${randomNum}`; 
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    let finalInstitutionId = null;
    let generatedCodeForInstitution = null;

    if (practiceType === 'private' && institutionCode.trim() !== '') {
      try {
        const cleanCode = institutionCode.trim().toUpperCase();

        const { data: instProfile, error: searchError } = await supabase
          .from('Profiles')
          .select('id')
          .ilike('institution_code', cleanCode) 
          .eq('role', 'institution')
          .maybeSingle();

        if (searchError) throw searchError;

        if (instProfile) {
          finalInstitutionId = instProfile.id;
        } else {
          setErrorMsg('קוד המוסד שהוזן אינו קיים במערכת. אנא בדקו את הקוד שוב.');
          setLoading(false);
          return;
        }
      } catch (searchErr: any) {
        console.error('Error searching institution code:', searchErr);
        setErrorMsg('חלה שגיאה בבדיקת קוד המוסד. נסו שוב.');
        setLoading(false);
        return;
      }
    }

    if (practiceType === 'institution') {
      generatedCodeForInstitution = generateRandomCode();
    }

    const { data, error } = await supabase.auth.signUp({
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
      if (error.message.includes('User already registered') || error.status === 422) {
        setErrorMsg('כתובת המייל הזו כבר רשומה במערכת. נסו להתחבר.');
      } else {
        setErrorMsg('חלה שגיאה בתהליך ההרשמה: ' + error.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('Profiles') 
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              role: practiceType === 'institution' ? 'institution' : 'moderator',
              institution_code: generatedCodeForInstitution,
              institution_id: finalInstitutionId 
            }
          ]);

        if (profileError) throw profileError;

        if (practiceType === 'institution') {
          alert(`ההרשמה הצליחה! קוד המוסד הייחודי שלכם הוא: ${generatedCodeForInstitution}. המנחים שלכם יוכלו להשתמש בו בהרשמה.`);
        } else {
          alert('ההרשמה הצליחה! כעת ניתן להתחבר.');
        }
        
        router.push('/login');

      } catch (err: any) {
        console.error('Error creating profile:', err);
        setErrorMsg('החשבון נוצר אך חלה שגיאה בשמירת הנתונים בטבלה: ' + err.message);
        setLoading(false);
      }
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

        <div className="bg-gray-200 p-1 rounded-2xl flex mb-8">
          <button 
            type="button"
            onClick={() => setPracticeType('private')}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${practiceType === 'private' ? 'bg-white text-[#003643] shadow-sm' : 'text-gray-500'}`}
          >
            מטפל עצמאי / מנחה
          </button>
          <button 
            type="button"
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

          {practiceType === 'private' && (
            <div className="space-y-1.5 text-right animate-fadeIn">
              <label className="text-sm font-medium text-gray-700 px-1 flex justify-between flex-row-reverse">
                <span>קוד מוסד משויך</span>
                <span className="text-xs text-gray-400 font-normal">(אופציונלי)</span>
              </label>
              <input 
                className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#a0cdde] text-right outline-none placeholder:text-gray-400 font-mono"
                placeholder="למשל: PSG-1234"
                value={institutionCode}
                onChange={(e) => setInstitutionCode(e.target.value)}
              />
              <p className="text-xs text-gray-400 px-1 mt-1">אם קיבלת קוד ממכון או מוסד שעמו אתם עובדים, הזן אותו כאן כדי להשתייך אליו.</p>
            </div>
          )}

          {errorMsg && <p className="text-red-600 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{errorMsg}</p>}

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