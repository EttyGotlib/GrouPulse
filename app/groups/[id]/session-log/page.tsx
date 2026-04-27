"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionLogPage() {
  const router = useRouter();
  
  // State פשוט לניהול כפתורי הבחירה (לדוגמה)
  const [cohesion, setCohesion] = useState('גבוהה');
  const [engagement, setEngagement] = useState('מאוזנת');
  const [atmosphere, setAtmosphere] = useState('תומכת');

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen text-[#181c1f] font-sans pb-32">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="flex flex-row-reverse justify-between items-center w-full px-6 py-4">
          <button className="material-symbols-outlined text-[#003643]">calendar_today</button>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-lg text-[#003643]">יומן מפגש: דינמיקה קבוצתית</h1>
            <span className="text-xs font-medium text-slate-500">24.05.24 | חרדה חברתית ודינמיקה</span>
          </div>
          <button onClick={() => router.back()} className="material-symbols-outlined text-[#003643]">arrow_forward</button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 mt-8 space-y-10">
        
        {/* Section 1: Group Documentation */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#003643]">תיעוד קבוצתי</h2>
            <span className="bg-[#b7ecf3] text-[#386c73] px-3 py-1 rounded-full text-xs font-bold">מפגש מס' 12</span>
          </div>
          
          <div className="bg-white rounded-2xl p-1 shadow-sm ring-1 ring-slate-100">
            <textarea 
              className="w-full min-h-[160px] bg-[#f1f4f8] border-none rounded-xl p-6 focus:ring-0 focus:bg-white transition-all leading-relaxed" 
              placeholder="תאר את מהלך המפגש, תמות מרכזיות ודינמיקה בין המשתתפים..."
            ></textarea>
          </div>

          {/* Group Metrics */}
          <div className="grid grid-cols-1 gap-4 bg-[#f1f4f8]/50 p-4 rounded-2xl border border-slate-100">
            {/* לכידות */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#003643] px-1">מדד לכידות קבוצתית</label>
              <div className="flex gap-2">
                {['נמוכה', 'בינונית', 'גבוהה'].map((val) => (
                  <button 
                    key={val}
                    onClick={() => setCohesion(val)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${cohesion === val ? 'bg-[#003643] text-white' : 'bg-white border-slate-200'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            {/* מעורבות */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#003643] px-1">רמת מעורבות כללית</label>
              <div className="flex gap-2">
                {['פאסיבית', 'מאוזנת', 'אינטנסיבית'].map((val) => (
                  <button 
                    key={val}
                    onClick={() => setEngagement(val)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${engagement === val ? 'bg-[#003643] text-white' : 'bg-white border-slate-200'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Attendance */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#003643]">צ'ק-ליסט נוכחות</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'אלון ר.', present: true },
              { name: 'מיכל כ.', present: false },
              { name: 'יואב ל.', present: true },
              { name: 'דנה פ.', present: true }
            ].map((person, i) => (
              <div key={i} className="bg-[#f1f4f8] p-4 rounded-xl flex items-center justify-between hover:bg-slate-200 transition-colors cursor-pointer">
                <span className="font-medium">{person.name}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${person.present ? 'bg-[#003643] border-[#003643]' : 'border-slate-300'}`}>
                  {person.present && <span className="material-symbols-outlined text-white text-sm">check</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Individual Documentation */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#003643]">תיעוד פרטני</h2>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#b7ecf3] flex items-center justify-center text-[#386c73] font-bold">אר</div>
                  <div>
                    <h3 className="font-bold text-[#003643]">אלון ר.</h3>
                    <p className="text-xs text-slate-500">פעיל במיוחד המפגש</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#003643]">expand_less</span>
              </div>
              <textarea 
                className="w-full bg-[#f1f4f8] border-none rounded-xl p-4 text-sm leading-relaxed focus:ring-0" 
                rows={4}
                defaultValue="אלון הפגין רמה גבוהה של מודעות עצמית היום. הוא שיתף בקושי שלו ליזום שיחה וזכה לתמיכה רבה."
              ></textarea>
            </div>
            
            {/* Collapsed Items */}
            {['מיכל כ.', 'יואב ל.'].map((name, i) => (
              <div key={i} className="bg-[#f1f4f8] rounded-xl px-6 py-4 flex items-center justify-between hover:bg-slate-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold">
                    {name.substring(0, 1)}
                  </div>
                  <h3 className="font-bold text-slate-700">{name}</h3>
                </div>
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </div>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-6">
          <button className="w-full py-5 bg-[#003643] text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">save</span>
            שמור תיעוד
          </button>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex flex-row-reverse justify-around items-center px-4 pb-8 pt-4 bg-white/90 backdrop-blur-md rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center text-slate-400">
              <span className="material-symbols-outlined">home</span>
              <span className="text-[10px] font-bold mt-1">בית</span>
          </div>
          <div className="flex flex-col items-center bg-[#1e4d5b] text-white rounded-2xl px-4 py-2">
              <span className="material-symbols-outlined">group</span>
              <span className="text-[10px] font-bold mt-1">הקבוצות שלי</span>
          </div>
          <div className="flex flex-col items-center text-slate-400">
              <span className="material-symbols-outlined">menu_book</span>
              <span className="text-[10px] font-bold mt-1">יומן מפגשים</span>
          </div>
          <div className="flex flex-col items-center text-slate-400">
              <span className="material-symbols-outlined">insights</span>
              <span className="text-[10px] font-bold mt-1">אנליטיקה</span>
          </div>
          <div className="flex flex-col items-center text-slate-400">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-[10px] font-bold mt-1">הגדרות</span>
          </div>
      </nav>
    </div>
  );
}