"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AiSummaryPage() {
  const router = useRouter();
  const { id, num } = useParams();
  
  // מפתחות ל-LocalStorage
  const logStorageKey = `session_log_${id}_${num}`;
  const manualKey = `ai_manual_insights_${id}_${num}`;

  // State לנתונים הדינמיים
  const [aiData, setAiData] = useState<any>(null);
  const [manualText, setManualText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAiSummary = async () => {
      setIsLoading(true);
      try {
        // 1. שליפת הנתונים הגולמיים שנשמרו בדף התיעוד
        const rawData = localStorage.getItem(logStorageKey);
        const savedManual = localStorage.getItem(manualKey);
        if (savedManual) setManualText(savedManual);

        if (rawData) {
          // 2. פנייה ל-API של Gemini עם הנתונים האמיתיים
          const response = await fetch('/api/generate-summary', {
            method: 'POST',
            body: JSON.stringify({ 
              prompt: `נתח את נתוני המפגש הבאים והחזר תשובה בפורמט JSON בלבד עם השדות: insights (מערך של 3 תובנות), cohesionScore (מספר 0-100), dynamicsDescription (טקסט קצר), individualHighlights (מערך של אובייקטים name ו-text). הנתונים: ${rawData}` 
            }),
          });
          const result = await response.json();
          setAiData(JSON.parse(result.text));
        }
      } catch (error) {
        console.error("Error fetching AI data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAiSummary();
  }, [id, num, logStorageKey, manualKey]);

  const handleSave = () => {
    localStorage.setItem(manualKey, manualText);
    setIsEditing(false);
  };

  const handlePrint = () => window.print();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-sans text-[#003643]">מייצר סיכום AI חכם...</div>;

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen pb-32 font-sans text-[#181c1f] print:bg-white print:pb-0">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex flex-row-reverse justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="bg-[#003643] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">print</span>
                הורד סיכום (PDF)
            </button>
            <h1 className="font-bold text-[#003643] text-lg">סיכום מפגש</h1>
        </div>
        <button onClick={() => router.back()} className="material-symbols-outlined text-[#003643]">arrow_forward</button>
      </header>

      {/* תוכן הסיכום */}
      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-6 print:pt-0 print:max-w-full">
        
        {/* כותרת */}
        <div className="text-center md:text-right space-y-2 pt-4">
            <span className="text-[#32666d] text-xs font-bold uppercase tracking-widest print:text-black">ניתוח מערכת AI</span>
            <h2 className="text-3xl font-black text-[#003643] print:text-black">סיכום מפגש מבוסס AI</h2>
            <p className="text-slate-500 text-sm font-medium">מפגש קבוצתי: תמיכה רגשית - מפגש {num}</p>
        </div>

        {/* כרטיסיית תובנות - דינמי */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 print:border-slate-200">
            <h3 className="font-bold text-[#003643] text-xl mb-6 print:text-black flex items-center gap-2">
              <span className="material-symbols-outlined print:hidden">lightbulb</span> תובנות מפתח
            </h3>
            <ul className="space-y-5">
                {aiData?.insights?.map((insight: string, i: number) => (
                    <li key={i} className="flex gap-4 items-start text-right">
                        <div className="w-2 h-2 rounded-full bg-[#b7ecf3] mt-2 shrink-0 print:bg-black"></div>
                        <p className="text-slate-600 text-md leading-relaxed print:text-black">{insight}</p>
                    </li>
                ))}
            </ul>
        </section>

        {/* דינמיקה - דינמי */}
        <section className="bg-[#f1f4f8] rounded-[32px] p-8 border border-slate-100 print:bg-white print:border-slate-200">
            <h3 className="font-bold text-[#003643] text-xl mb-6 print:text-black flex items-center gap-2">
              <span className="material-symbols-outlined print:hidden">group</span> דינמיקה קבוצתית
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[#32666d] print:text-black">לכידות קבוצתית: {aiData?.cohesionScore}%</span>
                </div>
                <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-slate-200">
                    <div className="bg-[#32666d] h-full rounded-full" style={{ width: `${aiData?.cohesionScore}%` }}></div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mt-4 text-right print:text-black">
                    {aiData?.dynamicsDescription}
                </p>
            </div>
        </section>

        {/* דגשים פרטניים - דינמי */}
        <section className="space-y-4">
            <h3 className="font-bold text-[#003643] text-xl px-1 print:text-black flex items-center gap-2">
              <span className="material-symbols-outlined print:hidden">person_search</span> דגשים פרטניים
            </h3>
            <div className="grid gap-3">
                {aiData?.individualHighlights?.map((p: any, i: number) => (
                    <div key={i} className="bg-white p-5 rounded-3xl flex items-center gap-4 shadow-sm border-l-4 border-l-[#b7ecf3] print:border-slate-200">
                        <div className="flex-1 text-right">
                            <h4 className="font-bold text-[#003643] text-sm print:text-black">{p.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed print:text-black">{p.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* תובנות ידניות */}
        <section className={`space-y-3 ${!manualText && 'print:hidden'}`}>
            <h3 className="font-bold text-[#32666d] text-sm px-1 flex items-center gap-2 print:hidden">
              <span className="material-symbols-outlined">edit_note</span> הערות ותובנות ידניות
            </h3>
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 print:border-slate-200">
                 <p className="text-slate-600 text-sm whitespace-pre-wrap text-right">
                    {manualText || "לא נוספו הערות ידניות."}
                 </p>
            </div>

            {/* אזור עריכה - מוסתר בזמן הדפסה */}
            <div className="print:hidden">
                {isEditing ? (
                    <div className="mt-4 space-y-4">
                        <textarea value={manualText} onChange={(e) => setManualText(e.target.value)} className="w-full min-h-[120px] bg-white border border-slate-200 rounded-2xl p-5 outline-none text-right" />
                        <button onClick={handleSave} className="w-full py-3 bg-[#003643] text-white rounded-xl font-bold">שמירה</button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="w-full py-4 text-[#32666d] font-bold text-sm border-2 border-dashed border-[#32666d]/30 rounded-2xl mt-4">
                        עריכת תובנות ידנית
                    </button>
                )}
            </div>
        </section>
      </main>
    </div>
  );
}