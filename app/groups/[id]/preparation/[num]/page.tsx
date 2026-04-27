"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PreparationPage() {
  const router = useRouter();
  const { id, num } = useParams();

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen pb-32 font-sans text-[#181c1f]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex flex-row-reverse justify-between items-center w-full px-6 h-16 border-b border-slate-100">
        <h1 className="font-bold text-lg text-[#003643]">הכנה למפגש</h1>
        <button 
          onClick={() => router.back()} 
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6 flex flex-col gap-8">
        
        {/* Section 1: Session Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-50">
            <label className="text-slate-400 text-[11px] font-bold block mb-1 uppercase tracking-wider">שם הקבוצה</label>
            <h2 className="text-xl font-extrabold text-[#003643] leading-tight">קבוצת צעירים - מיומנויות חברתיות</h2>
            <div className="mt-4 flex items-center gap-2 text-[#32666d]">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              <span className="text-sm font-semibold">14 באפריל, 2024</span>
            </div>
          </div>
          <div className="bg-[#003643] text-white p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-4xl font-black">{num}</span>
            <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-1">מספר מפגש</span>
          </div>
        </section>

        {/* Section 2: Goals */}
        <section className="bg-[#f1f4f8] p-6 rounded-3xl border border-slate-100">
          <div className="flex items-center gap-2 mb-4 border-r-4 border-[#32666d] pr-3">
            <h3 className="text-lg font-bold text-[#003643]">מטרות המפגש</h3>
          </div>
          <div className="space-y-3">
            {[
              "חיזוק תחושת השייכות דרך תרגיל 'מעגל חוזקות'.",
              "זיהוי דפוסי תקשורת לא מילוליים בתוך הקונפליקט."
            ].map((goal, i) => (
              <div key={i} className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm border border-slate-50">
                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-[#003643] focus:ring-[#003643]" />
                <p className="text-sm font-medium text-slate-700">{goal}</p>
              </div>
            ))}
            <input 
              type="text" 
              placeholder="+ הוספת מטרה חדשה"
              className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm font-bold bg-transparent hover:bg-white transition-all outline-none focus:border-solid focus:border-[#32666d]"
            />
          </div>
        </section>

        {/* Section 3: Interventions */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-[#003643] px-1">תכנון התערבויות</h3>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                 <span className="bg-[#b7ecf3] text-[#164e54] px-3 py-1 rounded-full text-[10px] font-bold uppercase">פתיחה (15 דק')</span>
                 <span className="material-symbols-outlined text-slate-300 cursor-pointer">more_horiz</span>
              </div>
              <h4 className="font-bold text-[#003643] text-md">תרגיל דמיון מונחה</h4>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">שימוש בטכניקת "החוף הבטוח" לוויסות רגשי ראשוני לאחר שבוע עמוס.</p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                 <span className="bg-[#b3edea] text-[#0e4f4d] px-3 py-1 rounded-full text-[10px] font-bold uppercase">לב המפגש (40 דק')</span>
                 <span className="material-symbols-outlined text-slate-300 cursor-pointer">more_horiz</span>
              </div>
              <h4 className="font-bold text-[#003643] text-md">משחק תפקידים אסימטרי</h4>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">חלוקה לזוגות: צד אחד מביע כעס והשני מתרגל הקשבה פעילה ללא שיפוטיות.</p>
          </div>
        </section>

        {/* Section 4: Equipment */}
        <section className="bg-[#e5e8ed] p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-[#003643] mb-4 px-1">ציוד ועזרים</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'קלפי "מרלין"', checked: true },
              { label: 'טושים ודפים', checked: false },
              { label: 'רמקול Bluetooth', checked: true },
              { label: 'טיימר מטבח', checked: false }
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl cursor-pointer hover:shadow-md transition-all border border-transparent active:scale-95">
                <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 rounded border-slate-300 text-[#003643] focus:ring-[#003643]" />
                <span className="text-xs font-bold text-slate-600">{item.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Section 5: Reminders */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-[#003643]">תזכורות אישיות</h3>
            <button className="text-[#32666d] text-xs font-bold underline">עריכה</button>
          </div>
          <div className="space-y-3">
            {[
              { name: "דניאל ל.", note: "לשים לב אם הוא נמנע מהתבטאות במעגל הפתיחה.", img: "https://i.pravatar.cc/150?u=dan" },
              { name: "רועי כ.", note: "לוודא שהוא מרגיש בנוח עם נושא המפגש הקודם.", img: "https://i.pravatar.cc/150?u=roi" }
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                <img src={p.img} alt={p.name} className="w-12 h-12 rounded-full object-cover bg-slate-100" />
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-[#003643]">{p.name}</h5>
                  <p className="text-xs text-slate-500 mt-0.5">{p.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex flex-row-reverse justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-md rounded-t-[32px] border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center p-2 text-slate-400">
              <span className="material-symbols-outlined">home</span>
              <span className="text-[10px] font-bold mt-1">בית</span>
          </div>
          <div className="flex flex-col items-center bg-[#1e4d5b] text-white rounded-2xl p-2 min-w-[64px] shadow-lg shadow-cyan-900/20">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
              <span className="text-[10px] font-bold mt-1">הקבוצות שלי</span>
          </div>
          <div className="flex flex-col items-center p-2 text-slate-400">
              <span className="material-symbols-outlined">calendar_month</span>
              <span className="text-[10px] font-bold mt-1">יומן</span>
          </div>
          <div className="flex flex-col items-center p-2 text-slate-400">
              <span className="material-symbols-outlined">insights</span>
              <span className="text-[10px] font-bold mt-1">אנליטיקה</span>
          </div>
          <div className="flex flex-col items-center p-2 text-slate-400">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-[10px] font-bold mt-1">הגדרות</span>
          </div>
      </nav>
    </div>
  );
}