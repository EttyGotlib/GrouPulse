"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AiSummaryPage() {
  const router = useRouter();
  const { id, num } = useParams();
  
  const storageKey = `ai_manual_insights_${id}_${num}`;
  const [manualText, setManualText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setManualText(saved);
  }, [storageKey]);

  const handleSave = () => {
    localStorage.setItem(storageKey, manualText);
    setIsEditing(false);
  };

  // הפתרון הסופי: פקודת הדפסה פשוטה ומושלמת
  const handlePrint = () => {
    window.print();
  };

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen pb-32 font-sans text-[#181c1f] print:bg-white print:pb-0">
      
      {/* Header - מוסתר בזמן הדפסה */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex flex-row-reverse justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
            <button 
                onClick={handlePrint}
                className="bg-[#003643] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined text-sm">print</span>
                הורד סיכום (PDF)
            </button>
            <h1 className="font-bold text-[#003643] text-lg">סיכום מפגש</h1>
        </div>
        <button onClick={() => router.back()} className="material-symbols-outlined text-[#003643]">arrow_forward</button>
      </header>

      {/* תוכן הסיכום */}
      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-6 print:pt-0 print:max-w-full">
        
        {/* כותרת הסיכום */}
        <div className="text-center md:text-right space-y-2 pt-4">
            <span className="text-[#32666d] text-xs font-bold uppercase tracking-widest print:text-black">ניתוח מערכת AI</span>
            <h2 className="text-3xl font-black text-[#003643] print:text-black">סיכום מפגש מבוסס AI</h2>
            <p className="text-slate-500 text-sm font-medium">מפגש קבוצתי: תמיכה רגשית - מפגש {num}</p>
        </div>

        {/* כרטיסיית תובנות */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 print:shadow-none print:border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[#003643] bg-[#f1f4f8] p-2 rounded-xl print:hidden">lightbulb</span>
                <h3 className="font-bold text-[#003643] text-xl print:text-black">תובנות מפתח</h3>
            </div>
            <ul className="space-y-5">
                {[
                    "הקבוצה הפגינה רמה גבוהה של פתיחות בנושא התמודדות עם שינויים בקריירה.",
                    "זוהה דפוס חוזר של חיפוש אישור הדדי בין המשתתפים הוותיקים לחדשים.",
                    "העלייה ברמת האמון אפשרה דיון עמוק יותר בטראומות עבר מאשר במפגשים קודמים."
                ].map((insight, i) => (
                    <li key={i} className="flex gap-4 items-start text-right">
                        <div className="w-2 h-2 rounded-full bg-[#b7ecf3] mt-2 shrink-0 print:bg-black"></div>
                        <p className="text-slate-600 text-md leading-relaxed print:text-black">{insight}</p>
                    </li>
                ))}
            </ul>
        </section>

        {/* כרטיסיית דינמיקה */}
        <section className="bg-[#f1f4f8] rounded-[32px] p-8 border border-slate-100 print:bg-white print:border-slate-200">
            <div className="flex items-center gap-3 mb-6 text-right">
                <span className="material-symbols-outlined text-[#003643] print:hidden">group</span>
                <h3 className="font-bold text-[#003643] text-xl print:text-black">דינמיקה קבוצתית</h3>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[#32666d] print:text-black">לכידות קבוצתית: 85%</span>
                </div>
                {/* פס התקדמות - נשתמש ב-border פשוט לזמן הדפסה כדי שיעבוד טוב */}
                <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-slate-200">
                    <div className="bg-[#32666d] h-full w-[85%] rounded-full print:bg-slate-700"></div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mt-4 text-right print:text-black">
                    האווירה הייתה מכילה ותומכת. חברי הקבוצה שמרו על הקשבה פעילה והציעו תמיכה אמפתית ללא שיפוטיות.
                </p>
            </div>
        </section>

        {/* דגשים פרטניים */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 px-1 text-right">
                <span className="material-symbols-outlined text-[#003643] print:hidden">person_search</span>
                <h3 className="font-bold text-[#003643] text-xl print:text-black">דגשים פרטניים</h3>
            </div>
            <div className="grid gap-3">
                {[
                    { name: 'יוסי ל.', text: 'שיתף לראשונה בתחושת הבדידות בעבודה. דורש מעקב במפגש הבא.' },
                    { name: 'מיכל א.', text: 'הפגינה שיפור משמעותי ביכולת להציב גבולות מול חברי הקבוצה.' }
                ].map((p, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl flex items-center gap-4 shadow-sm border-l-4 border-l-[#b7ecf3] print:shadow-none print:border-slate-200">
                        <div className="flex-1 text-right">
                            <h4 className="font-bold text-[#003643] text-sm print:text-black">{p.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed print:text-black">{p.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* תובנות ידניות - יוצגו תמיד בזמן הדפסה */}
        <section className={`space-y-3 ${!manualText && 'print:hidden'}`}>
            <div className="flex items-center gap-2 px-1 print:hidden">
                <span className="material-symbols-outlined text-[#32666d]">edit_note</span>
                <h3 className="font-bold text-[#32666d] text-sm">הערות ותובנות ידניות</h3>
            </div>
            
            {/* תצוגת הטקסט ל-PDF */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 print:shadow-none print:border-slate-200">
                 <p className="text-slate-600 text-sm whitespace-pre-wrap text-right">
                    {manualText || (isEditing ? "כותבת תובנות..." : "לא נוספו הערות ידניות.")}
                 </p>
            </div>

            {/* אזור עריכה - מוסתר בזמן הדפסה */}
            <div className="print:hidden">
                {isEditing ? (
                    <div className="mt-4 space-y-4">
                        <textarea 
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            className="w-full min-h-[120px] bg-white border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-[#003643] outline-none text-right" 
                            placeholder="הוסיפי תובנות..."
                        ></textarea>
                        <button onClick={handleSave} className="w-full py-3 bg-[#003643] text-white rounded-xl font-bold">שמירה</button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="w-full py-4 text-[#32666d] font-bold text-sm border-2 border-dashed border-[#32666d]/30 rounded-2xl mt-4"
                    >
                        עריכת תובנות ידנית
                    </button>
                )}
            </div>
        </section>
      </main>
    </div>
  );
}