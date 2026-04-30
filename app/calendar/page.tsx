"use client";

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/navigation';

// הגדרת טיפוסים עבור TypeScript
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarPage() {
  const router = useRouter();
  const [value, onChange] = useState<Value>(new Date());

  // נתונים לדוגמה הכוללים מזהה קבוצה ומספר מפגש
  const sessions = [
    { 
      id: "123", // מזהה הקבוצה [id]
      num: "1",  // מספר המפגש [num]
      time: "16:00", 
      group: "קבוצת מנהיגות", 
      location: "חדר 302", 
      date: new Date().toDateString()
    }
  ];

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen font-sans pb-32 flex flex-col">
      
      {/* Header */}
      <header className="bg-white px-6 h-16 flex items-center justify-between border-b border-slate-100 shadow-sm shrink-0">
        <h1 className="text-lg font-extrabold text-[#003643]">היומן שלי</h1>
        <button className="p-2 bg-slate-50 rounded-full text-[#32666d]">
          <span className="material-symbols-outlined">add</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-6">
        
        {/* לוח שנה */}
        <section className="bg-white rounded-[32px] shadow-sm border border-slate-50 p-4 mb-6">
          <Calendar
            onChange={onChange}
            value={value}
            locale="he-IL"
            className="border-none w-full font-sans"
            tileClassName="rounded-xl transition-all"
          />
        </section>

        {/* רשימת פגישות */}
        <section className="space-y-4">
          <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">פגישות ליום שנבחר</h3>
            <span className="text-[10px] bg-[#32666d]/10 text-[#32666d] px-2 py-1 rounded-full font-bold">
              {value instanceof Date ? value.toLocaleDateString('he-IL') : 'בחר תאריך'}
            </span>
          </div>

          {sessions
            .filter(s => s.date === (value instanceof Date ? value.toDateString() : ""))
            .map((session) => (
              <div key={`${session.id}-${session.num}`} className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-50 flex flex-col gap-4">
                
                <div className="flex flex-row items-center justify-between w-full">
                  
                  {/* צד שמאל: שורת כפתורי ניווט */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    <button 
                      onClick={() => router.push(`/groups/${session.id}/preparation/${session.num}`)}
                      className="py-2 px-3 border border-slate-100 rounded-xl text-[#003643] text-[10px] font-bold bg-white whitespace-nowrap active:bg-slate-50 shadow-sm"
                    >
                      הכנה
                    </button>
                    
                    <button 
                      onClick={() => router.push(`/groups/${session.id}/session-log/${session.num}`)}
                      className="py-2 px-3 border border-slate-100 rounded-xl text-[#003643] text-[10px] font-bold bg-white whitespace-nowrap active:bg-slate-50 shadow-sm"
                    >
                      תיעוד
                    </button>

                    <button 
                      onClick={() => router.push(`/groups/${session.id}/ai-summary/${session.num}`)}
                      className="py-2 px-3 bg-[#1e4e56] rounded-xl text-white text-[10px] font-bold whitespace-nowrap flex items-center gap-1 shadow-md active:scale-95 transition-all"
                    >
                      <span>סיכום AI</span>
                      <span className="material-symbols-outlined text-[12px] text-amber-200">auto_awesome</span>
                    </button>
                  </div>

                  {/* צד ימין: פרטי המפגש */}
                  <div className="flex flex-row-reverse items-center gap-2">
                    <div className="text-right">
                      <h4 className="text-xs font-bold text-[#003643] leading-tight">{session.group}</h4>
                      <div className="flex flex-row-reverse items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-[10px]">location_on</span>
                        <p className="text-[9px] font-medium">{session.location}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center min-w-[50px] border border-slate-100">
                      <span className="text-xs font-bold text-[#32666d]">{session.time}</span>
                    </div>
                  </div>

                </div>
              </div>
            ))}

          {/* הודעה כשאין פגישות */}
          {sessions.filter(s => s.date === (value instanceof Date ? value.toDateString() : "")).length === 0 && (
            <div className="text-center py-10 bg-white/50 rounded-3xl border border-dashed border-slate-200 mx-2">
              <p className="text-slate-400 text-xs italic font-medium">אין פגישות מתוכננות ליום זה</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}