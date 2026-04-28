"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState('קבוצת נוער א\'');

  // פונקציית ההדפסה שיוצרת את ה-PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen pb-32 font-sans text-[#181c1f] print:bg-white print:pb-0">
      
      {/* Header Bar - מוסתר בזמן הדפסה */}
      <header className="bg-white px-6 py-6 flex flex-row-reverse justify-between items-center border-b border-slate-50 sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#003643]">person</span>
          </div>
          <h1 className="font-bold text-[#003643] text-lg">תובנות קבוצתיות</h1>
        </div>
        <span className="material-symbols-outlined text-[#003643]">menu</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6 space-y-6 print:pt-0 print:max-w-full">
        
        {/* בחירת קבוצה - מוסתר בזמן הדפסה */}
        <div className="space-y-2 print:hidden">
            <label className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-wider">בחירת קבוצה לצפייה</label>
            <div className="relative">
                <select 
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-[20px] px-5 py-4 text-[#003643] font-bold text-sm appearance-none shadow-sm focus:ring-2 focus:ring-[#b7ecf3] outline-none transition-all cursor-pointer"
                >
                    <option>קבוצת נוער א'</option>
                    <option>סדנת הורים - מחזור ב'</option>
                    <option>קבוצת תמיכה רגשית</option>
                </select>
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#003643] pointer-events-none">
                    expand_more
                </span>
            </div>
        </div>

        {/* כותרת מיוחדת שמופיעה רק ב-PDF */}
        <div className="hidden print:block text-right mb-8 border-b-2 border-[#003643] pb-4">
            <h2 className="text-2xl font-black text-[#003643]">דוח אנליטיקה תקופתי</h2>
            <p className="text-slate-600 font-bold">קבוצה: {selectedGroup}</p>
            <p className="text-slate-400 text-xs mt-1">הופק ע"י מערכת ניתוח AI - {new Date().toLocaleDateString('he-IL')}</p>
        </div>

        {/* גרף מעורבות */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 print:shadow-none print:border-slate-200">
            <div className="text-center mb-8">
                <h3 className="font-bold text-[#003643] text-xl">רמת המעורבות לאורך זמן</h3>
            </div>
            
            <div className="flex justify-between items-end h-40 px-2">
                {[
                    { h: '40%', label: 'מפגש 1' },
                    { h: '65%', label: 'מפגש 4' },
                    { h: '85%', label: 'מפגש 8', active: true },
                    { h: '75%', label: 'מפגש אחרון' }
                ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-12">
                        <div className="w-full bg-[#f1f4f8] rounded-full h-32 relative overflow-hidden print:border print:border-slate-100">
                            <div 
                                className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 ${bar.active ? 'bg-[#32666d]/40' : 'bg-[#b7ecf3]'}`}
                                style={{ height: bar.h }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{bar.label}</span>
                    </div>
                ))}
            </div>
        </section>

        {/* לכידות קבוצתית */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#003643] rounded-[32px] p-8 text-white flex flex-col items-center justify-center h-64 shadow-lg print:border print:border-slate-800">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364" strokeDashoffset="44" className="text-[#b7ecf3]" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black">88%</span>
                        <span className="text-[10px] opacity-70">מגמת עלייה</span>
                    </div>
                </div>
                <h3 className="font-bold mt-4 text-lg">לכידות קבוצתית</h3>
            </div>

            <div className="grid grid-rows-2 gap-4">
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-50 flex flex-col justify-between print:border-slate-200">
                    <span className="text-slate-400 text-xs font-bold">מעורבות כללית</span>
                    <span className="text-2xl font-black text-[#003643]">74%</span>
                </div>
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-50 flex flex-col justify-between print:border-slate-200">
                    <span className="text-slate-400 text-xs font-bold">אווירה קבוצתית</span>
                    <span className="text-lg font-black text-[#32666d]">נינוחה</span>
                </div>
            </div>
        </div>

        {/* אנליטיקה לפי משתתפים */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 print:border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[#003643] print:hidden">person_search</span>
                <h3 className="font-bold text-[#003643] text-xl">אנליטיקה לפי משתתפים</h3>
            </div>
            
            <div className="space-y-6">
                {[
                    { name: 'נועם אברהמי', score: 92, color: 'bg-[#003643]' },
                    { name: 'מיכל כהן', score: 65, color: 'bg-[#32666d]' },
                    { name: 'יונתן לוי', score: 48, color: 'bg-red-400' },
                ].map((user, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-[#003643]">{user.name}</span>
                            <span className="text-xs font-bold text-slate-400">{user.score}% מעורבות</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50">
                            <div className={`h-full ${user.color} rounded-full`} style={{ width: `${user.score}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* כפתור הפקה - מוסתר בזמן הדפסה */}
        <button 
            onClick={handlePrint}
            className="w-full bg-[#32666d] text-white py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all print:hidden"
        >
            <span className="material-symbols-outlined">description</span>
            הפקת דוח תקופתי (PDF)
        </button>

      </main>
    </div>
  );
}