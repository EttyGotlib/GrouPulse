"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InstituteNav from '../../components/ui/InstituteNav';
// הוספת signOut לייבוא הקיים
import { getCurrentUserInfo, signOut } from '../../lib/api'; 

function SettingsContent() {
  const router = useRouter();
  // חילוץ הפרמטרים מה-URL
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType');
  
  // State לפרטי המשתמש
  const [userData, setUserData] = useState({
    fullName: "טוען...",
    role: "מנחה קבוצות",
    initials: ".."
  });

  useEffect(() => {
    async function loadUserInfo() {
      const result = await getCurrentUserInfo();
      if (result.success) {
        const name = result.data.fullName;
        setUserData({
          fullName: name,
          role: result.data.role,
          initials: name.charAt(0)
        });
      }
    }
    loadUserInfo();
  }, []);

  // פונקציה לביצוע התנתקות
  const handleLogout = async () => {
    // ביצוע הניתוק ב-Supabase
    const result = await signOut();
    if (result.success) {
      // העברה לדף ההתחברות שנמצא בנתיב /login
      router.push('/login');
    } else {
      alert("שגיאה בתהליך היציאה: " + result.error);
    }
  };

  // פונקציה ליצירת שורת הגדרות מעוצבת
  const SettingItem = ({ icon, title, subtitle, color = "text-slate-400" }: any) => (
    <div className="flex flex-row-reverse items-center justify-between p-5 bg-white rounded-2xl mb-3 shadow-sm border border-slate-50 active:scale-[0.98] transition-all cursor-pointer group">
      <div className="flex flex-row-reverse items-center gap-4">
        <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center ${color} group-hover:bg-[#003643] group-hover:text-white transition-colors`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <div className="text-right">
          <h4 className="text-sm font-bold text-[#003643]">{title}</h4>
          {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
      </div>
      <span className="material-symbols-outlined text-slate-300 text-sm">arrow_back_ios</span>
    </div>
  );

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen pb-32 font-sans text-[#181c1f]">
      
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex flex-row-reverse justify-between items-center w-full px-6 h-16 border-b border-slate-100">
        <h1 className="font-bold text-lg text-[#003643]">הגדרות</h1>
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 flex flex-col gap-8">
        
        {/* פרופיל משתמש */}
        <section className="text-center mb-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-[#003643] border-4 border-white shadow-xl mx-auto flex items-center justify-center text-white text-3xl font-bold">
              {userData.initials}
            </div>
            <button className="absolute bottom-0 right-0 bg-[#32666d] text-white p-1.5 rounded-full border-2 border-white shadow-md hover:bg-[#003643] transition-colors">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <h2 className="text-xl font-extrabold text-[#003643] mt-4">{userData.fullName}</h2>
          <p className="text-xs text-slate-400 font-bold">{userData.role}</p>
        </section>

        {/* קטגוריה: חשבון */}
        <section>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">חשבון ופרופיל</h3>
          <div onClick={() => router.push(`/settings/profile${userType === 'institute' ? '?userType=institute' : ''}`)}>
            <SettingItem icon="person" title="פרטים אישיים" subtitle="שם, אימייל ומקצוע" />
          </div>          
          <div onClick={() => router.push(`/settings/security${userType === 'institute' ? '?userType=institute' : ''}`)}>
             <SettingItem icon="lock" title="אבטחה" subtitle="שינוי סיסמה ואימות דו-שלבי" />
          </div>          
          <SettingItem icon="notifications" title="התראות" subtitle="ניהול תזכורות למפגשים ויומנים" />
        </section>

        {/* קטגוריה: אפליקציה */}
        <section>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">העדפות אפליקציה</h3>
          <div onClick={() => router.push(`/settings/display${userType === 'institute' ? '?userType=institute' : ''}`)}>
            <SettingItem icon="dark_mode" title="תצוגה" subtitle="מצב כהה ובהיר" />
          </div>          
          <SettingItem icon="palette" title="ערכת נושא" subtitle="התאמת צבעי המערכת" />
          <SettingItem icon="translate" title="שפה" subtitle="עברית (ברירת מחדל)" />
        </section>

        {/* קטגוריה: עזרה */}
        <section>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">תמיכה</h3>
          <SettingItem icon="help" title="מרכז עזרה" />
          <SettingItem icon="info" title="אודות המערכת" subtitle="גרסה 1.0.4" />
          
          {/* כפתור היציאה המחובר לפונקציה */}
          <button 
            onClick={handleLogout}
            className="w-full flex flex-row-reverse items-center justify-center gap-2 p-5 text-rose-500 font-bold text-sm bg-rose-50 rounded-2xl mt-4 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            יציאה מהחשבון
          </button>
        </section>

      </main>

      {/* הזרקת סרגל המוסד והסתרת סרגל המנחה הכללי בצורה חסינה במידה והיוזר הוא מוסד */}
      {userType === 'institute' && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            /* מסתיר בכוח את הסרגל התחתון הכללי של המנחה שמגיע מה-Layout */
            nav, footer, [class*="Navbar"], [class*="navbar"] {
              display: none !important;
            }
          ` }} />
          
          <InstituteNav />
        </>
      )}
    
    </div>
  );
}

// ייצוא העמוד הראשי עטוף ב-Suspense כדי למנוע קריסה בזמן קריאת הכתובת ב-Next.js
export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-[#003643]">טוען הגדרות...</div>}>
      <SettingsContent />
    </Suspense>
  );
}