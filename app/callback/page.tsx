'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // גורם לסופבייס להבין שהוא חזר מהמייל ומגדיר את ה-Session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error.message);
        // אם יש שגיאה באימות, נחזיר אותו לדף ההתחברות עם הודעה
        router.push('/login?error=auth_callback_failed');
        return;
      }

      if (data?.session) {
        // אימות הצליח! מעבירים לדאשבורד
        router.push('/dashboard');
      } else {
        // אין סשן - אולי הלינק פג תוקף
        router.push('/login');
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f9fe]">
      <div className="p-8 bg-white rounded-2xl shadow-sm text-center">
        {/* אפשר להוסיף כאן ספינר/אנימציית טעינה אם תרצי */}
        <h2 className="text-[#003643] font-bold text-xl mb-2">מאמת התחברות...</h2>
        <p className="text-gray-500">אנא המתינו רגע, אנחנו מעבירים אתכם למערכת</p>
      </div>
    </div>
  );
}