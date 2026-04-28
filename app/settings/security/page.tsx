"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecuritySettingsPage() {
  const router = useRouter();

  // ניהול מצב לשינוי סיסמה
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen font-sans text-[#181c1f] pb-20">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex flex-row-reverse justify-between items-center w-full px-6 h-16 border-b border-slate-100">
        <h1 className="font-bold text-lg text-[#003643]">אבטחה</h1>
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-10 pb-32">
                
        <section className="mb-10">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">שינוי סיסמה</h3>
          
          <div className="space-y-4">
            {/* סיסמה נוכחית */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#003643] pr-2">סיסמה נוכחית</label>
              <input 
                type="password" 
                name="current"
                value={passwords.current}
                onChange={handleChange}
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm"
              />
            </div>

            {/* סיסמה חדשה */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#003643] pr-2">סיסמה חדשה</label>
              <input 
                type="password" 
                name="new"
                value={passwords.new}
                onChange={handleChange}
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm"
              />
            </div>

            {/* אימות סיסמה */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#003643] pr-2">אימות סיסמה חדשה</label>
              <input 
                type="password" 
                name="confirm"
                value={passwords.confirm}
                onChange={handleChange}
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm"
              />
            </div>
          </div>

          <button 
            className="w-full mt-6 py-4 bg-[#32666d] text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
            onClick={() => alert("הבקשה לשינוי סיסמה תישלח לחברה שלך לחיבור ל-DB")}
          >
            עדכן סיסמה
          </button>
        </section>

        {/* אפשרויות נוספות */}
        <section>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">הגנות נוספות</h3>
          
          <div className="flex flex-row-reverse items-center justify-between p-5 bg-white rounded-2xl border border-slate-50 shadow-sm">
            <div className="text-right">
              <h4 className="text-sm font-bold text-[#003643]">אימות דו-שלבי</h4>
              <p className="text-[10px] text-slate-400">הוספת שכבת הגנה באמצעות קוד לנייד</p>
            </div>
            <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}