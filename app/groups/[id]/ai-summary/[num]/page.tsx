"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AiSummaryPage() {
  const router = useRouter();
  const { id, num } = useParams();
  
  // מפתחות ל-LocalStorage
  const logStorageKey = `session_log_${id}_${num}`;
  const manualKey = `ai_manual_insights_${id}_${num}`;
  const groupDataKey = `group_data_${id}`;


// State לשם הקבוצה כדי להציג אותו בכותרת
  const [groupName, setGroupName] = useState('');

  // State לנתונים הדינמיים
  const [aiData, setAiData] = useState<any>(null);
  const [manualText, setManualText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fallbackActive, setFallbackActive] = useState(false);

  // מניעת כפילות בקשות (Strict Mode Protection)
  const fetchedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    
    const fetchAiSummary = async () => {
      //if (fetchedRef.current) return;
      if (!id || !num) return;

      setIsLoading(true);
      try {
        const rawDataString = localStorage.getItem(logStorageKey);
        if (!rawDataString) {
          setHasData(false);
          setIsLoading(false);
          return;
        }// הוספה

        // --- 1. שליפת שם הקבוצה (תמיד קורה ראשון) ---
        const groupDataRaw = localStorage.getItem(groupDataKey);
        let currentGroupName = "קבוצה כללית";
        if (groupDataRaw) {
          const parsedGroup = JSON.parse(groupDataRaw);
          currentGroupName = parsedGroup.name || parsedGroup.title || currentGroupName;
        }
        setGroupName(currentGroupName); // עדכון ה-State לתצוגה בדף
        // ------------------------------------------
       
        // --- 2. בדיקת Cache ---
        const cacheKey = `ai_cache_${id}_${num}`;
        const cachedAiData = localStorage.getItem(cacheKey);
        
        if (cachedAiData) {
          const parsedCache = JSON.parse(cachedAiData);

          if (parsedCache.sourceData === rawDataString) {
            setAiData(parsedCache.aiResult);
            setIsLoading(false);
            return; // כאן הקוד עוצר אם יש Cache
          }
        }

        // --- 🔥 מניעת spam (קריאות מהירות) ---
        const lastCallKey = `ai_last_call_${id}_${num}`;
        const lastCall = localStorage.getItem(lastCallKey);

        if (lastCall && Date.now() - Number(lastCall) < 30000) {
          throw new Error("נא להמתין כמה שניות לפני ניסיון נוסף");
        }

        localStorage.setItem(lastCallKey, Date.now().toString());

        setIsLoading(true);
      
        const response = await fetch('/api/gen-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt: `
            אתה מנוע ניתוח נתונים.
            שם הקבוצה: "${currentGroupName}"

            החזר תשובה בפורמט JSON תקין בלבד.
            אסור להוסיף טקסט, הסברים או Markdown.

            דגשים לניתוח:
            תתנהג כאילו אתה מטפל ב-שם הקבוצה
            1. cohesionScore: אם במדד ה-cohesion כתוב "גבוהה" תן ציון 85-100, "בינונית" 50-80, "נמוכה" 10-40(לאחר ניתוח כללי מעמיק, מקצועי ואמין ולא רק על פי הנתון של "מדד לכידות קבוצתית בדף התיעוד")
            2. insights: חלץ 3 תובנות מקצועיות על הדינמיקה במהלך המפגש ביחס לשם הקבוצה(תאר במשפט).
            3. individualHighlights: התייחס לכל משתתף שמופיע בתיעוד הפרטני ולרמת ההשתתפות שלו(חלץ תובנות פרטניות ומקצועיות)
            

            הפורמט חייב להיות בדיוק:
            
            {
              "insights": string[],
              "cohesionScore": number,
              "dynamicsDescription": string,
              "individualHighlights": [
                { "name": string, "text": string }
              ]
            }
            
            כל הטקסטים בעברית.
            
            נתונים:
            ${rawDataString}
            `
          }),
        });
      
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("מכסת הבקשות ל-AI הסתיימה. נסה לרענן בעוד דקה.");
          }
          throw new Error(`Server error: ${response.status}`);
        }
      
        const result = await response.json();
      
        if (result.text) {
          try {
            // 1. ניקוי תגיות Markdown במידה וה-AI הוסיף אותן
            const cleanJson = result.text.replace(/```json|```/g, "").trim();
            let parsedData: { insights: string[]; cohesionScore: number; dynamicsDescription: string; individualHighlights: any[]; };

            try {
              // 2. ניסיון לפענח את ה-JSON
              parsedData = JSON.parse(cleanJson);
              
              // 3. עדכון ה-State של הדף
              setAiData(parsedData);

              // 4. שמירה ב-Cache עבור דף האנליטיקה (קורה רק אם ה-JSON תקין)
              const cacheToSave = {
                sourceData: rawDataString,
                aiResult: parsedData
              };
              localStorage.setItem(`ai_cache_${id}_${num}`, JSON.stringify(cacheToSave));
              
            } catch (innerError) {
              // מקרה שה-JSON לא תקין - יוצר נתוני Fallback זמניים
              console.error("JSON Parse Error, using fallback:", cleanJson);
              parsedData = {
                insights: ["שגיאה בניתוח הנתונים מה-AI"],
                cohesionScore: 0,
                dynamicsDescription: "לא ניתן היה לנתח את הנתונים במבנה תקין",
                individualHighlights: []
              };
              setAiData(parsedData);
              // לא שומרים ב-Cache במקרה של שגיאה כדי שנוכל לנסות שוב בריענון
            }

          } catch (err) {
            console.error("General parsing error:", err);
            throw new Error("התקבלה תשובה לא תקינה מה-AI");
          }
        } else {
          throw new Error("לא התקבל טקסט מה-AI");
        }
      } catch (error: any) {
        setErrorMsg(error.message || "שגיאה בטעינת הנתונים");
        setFallbackActive(true);
        console.error("Error fetching AI data:", error);
        // איפוס ה-Ref במקרה של שגיאה כדי לאפשר ניסיון חוזר ברענן
        fetchedRef.current = false; 
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

  const handleGoBack = () => {
    if (isMounted) {
      router.push(`/groups/${id}`);// תיקון ניתוב חזרה לדף הקבוצה במקום לדשבורד
    }
  };
  

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans text-[#003643] gap-4">
      <div className="w-12 h-12 border-4 border-[#b7ecf3] border-t-[#003643] rounded-full animate-spin"></div>
      <p className="font-bold">מייצר סיכום AI חכם...</p>
    </div>
  );

  if (fallbackActive) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans text-[#003643] p-6 text-center">
      <span className="material-symbols-outlined text-5xl mb-4 text-slate-300">error_outline</span>
      <h2 className="text-2xl font-bold">שגיאה בטעינת הנתונים</h2>
      <p className="text-slate-500 mt-2">{errorMsg}</p>
      <button onClick={handleGoBack} className="mt-6 bg-[#003643] text-white px-6 py-2 rounded-xl font-bold">חזרה לדף הקודם</button>
    </div>
  );
  if (!hasData) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans text-[#003643] p-6 text-center">
      <span className="material-symbols-outlined text-5xl mb-4 text-slate-300">error_outline</span>
      <h2 className="text-2xl font-bold">לא הוזן תיעוד למפגש זה</h2>
      <p className="text-slate-500 mt-2">יש למלא נוכחות או תיאור מפגש כדי להפיק סיכום.</p>
      <button onClick={handleGoBack} className="mt-6 bg-[#003643] text-white px-6 py-2 rounded-xl font-bold">חזרה ללוח הבקרה</button>
    </div>
  );

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen pb-32 font-sans text-[#181c1f] print:bg-white print:pb-0">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex flex-row-reverse justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="bg-[#003643] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#004d5f] transition-colors">
                <span className="material-symbols-outlined text-sm">print</span>
                הורד סיכום (PDF)
            </button>
            <h1 className="font-bold text-[#003643] text-lg">סיכום מפגש</h1>
        </div>
        <button onClick={handleGoBack} className="material-symbols-outlined text-[#003643] p-2 hover:bg-slate-100 rounded-full transition-colors">arrow_forward</button>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-6 print:pt-0 print:max-w-full">
        
        {/* כותרת */}
        <div className="text-center md:text-right space-y-2 pt-4">
            <span className="text-[#32666d] text-xs font-bold uppercase tracking-widest print:text-black">ניתוח מערכת AI</span>
            <h2 className="text-3xl font-black text-[#003643] print:text-black">סיכום מפגש מבוסס AI</h2>
            <p className="text-slate-500 text-sm font-medium">קבוצה: {groupName} - מפגש {num}</p>
        </div>

        {/* כרטיסיית תובנות */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 print:border-slate-200">
            <h3 className="font-bold text-[#003643] text-xl mb-6 print:text-black flex items-center gap-2">
              <span className="material-symbols-outlined print:hidden text-[#32666d]">lightbulb</span> תובנות מפתח
            </h3>
            <ul className="space-y-5">
                {aiData?.insights?.map((insight: string, i: number) => (
                    <li key={i} className="flex gap-4 items-start text-right">
                        <div className="w-2 h-2 rounded-full bg-[#b7ecf3] mt-2 shrink-0 print:bg-black"></div>
                        <p className="text-slate-600 text-md leading-relaxed print:text-black">{insight}</p>
                    </li>
                )) || <p className="text-slate-400 italic">לא חולצו תובנות למפגש זה.</p>}
            </ul>
        </section>

        {/* דינמיקה קבוצתית */}
        <section className="bg-[#f1f4f8] rounded-[32px] p-8 border border-slate-100 print:bg-white print:border-slate-200">
            <h3 className="font-bold text-[#003643] text-xl mb-6 print:text-black flex items-center gap-2">
              <span className="material-symbols-outlined print:hidden text-[#32666d]">group</span> דינמיקה קבוצתית
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[#32666d] print:text-black">לכידות קבוצתית: {aiData?.cohesionScore || 0}%</span>
                </div>
                <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-slate-200">
                    <div className="bg-[#32666d] h-full rounded-full transition-all duration-1000" style={{ width: `${aiData?.cohesionScore || 0}%` }}></div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mt-4 text-right print:text-black">
                    {aiData?.dynamicsDescription}
                </p>
            </div>
        </section>

        {/* דגשים פרטניים */}
        <section className="space-y-4">
            <h3 className="font-bold text-[#003643] text-xl px-1 print:text-black flex items-center gap-2">
              <span className="material-symbols-outlined print:hidden text-[#32666d]">person_search</span> דגשים פרטניים
            </h3>
            <div className="grid gap-3">
                {aiData?.individualHighlights?.map((p: any, i: number) => (
                    <div key={i} className="bg-white p-5 rounded-3xl flex items-center gap-4 shadow-sm border-l-4 border-l-[#b7ecf3] print:border-slate-200">
                        <div className="flex-1 text-right">
                            <h4 className="font-bold text-[#003643] text-sm print:text-black">{p.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed print:text-black">{p.text}</p>
                        </div>
                    </div>
                )) || <p className="text-slate-400 italic px-2">אין דגשים פרטניים למפגש זה.</p>}
            </div>
        </section>

        {/* תובנות ידניות */}
        <section className={`space-y-3 ${!manualText && !isEditing && 'print:hidden'}`}>
            <h3 className="font-bold text-[#32666d] text-sm px-1 flex items-center gap-2 print:hidden">
              <span className="material-symbols-outlined">edit_note</span> הערות ותובנות ידניות
            </h3>
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 print:border-slate-200">
                 <p className="text-slate-600 text-sm whitespace-pre-wrap text-right">
                    {manualText || "לא נוספו הערות ידניות."}
                 </p>
            </div>
            
            <div className="print:hidden">
                {isEditing ? (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <textarea 
                          value={manualText} 
                          onChange={(e) => setManualText(e.target.value)} 
                          placeholder="הוסף תובנות משלך על המפגש..."
                          className="w-full min-h-[120px] bg-white border border-slate-200 rounded-2xl p-5 outline-none text-right focus:border-[#32666d] transition-colors" 
                        />
                        <button onClick={handleSave} className="w-full py-3 bg-[#003643] text-white rounded-xl font-bold hover:bg-[#004d5f] transition-colors">שמירה</button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="w-full py-4 text-[#32666d] font-bold text-sm border-2 border-dashed border-[#32666d]/30 rounded-2xl mt-4 hover:bg-[#32666d]/5 transition-colors">
                        עריכת תובנות ידנית
                    </button>
                )}
            </div>
        </section>
      </main>
    </div>
  );
}