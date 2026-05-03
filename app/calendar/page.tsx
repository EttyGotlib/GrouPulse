"use client";

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/navigation';
// @ts-ignore
import { getAllModeratorSessions } from '../../lib/api'; // ודאי שהנתיב תואם למבנה שלך

export default function CalendarPage() {
  const router = useRouter();
  const [value, onChange] = useState<any>(new Date());
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await getAllModeratorSessions();
      if (result.success) {
        setAllSessions(result.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const selectedDateString = value instanceof Date ? value.toDateString() : "";
  const sessionsForDay = allSessions.filter((s: any) => s.date === selectedDateString);

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen font-sans pb-32 flex flex-col items-center">
      
      {/* Header */}
      <header className="bg-white w-full h-16 flex justify-center border-b border-slate-100 shadow-sm shrink-0">
        <div className="max-w-4xl w-full px-6 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-[#003643]">היומן שלי</h1>
          <button className="p-2 bg-slate-50 rounded-full text-[#32666d]">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl w-full px-4 pt-8 flex flex-col gap-8">
        
        {/* לוח שנה - מרכזי וגדול */}
        <section className="bg-white rounded-[40px] shadow-md border border-slate-50 p-6 md:p-10 w-full">
          <Calendar
            onChange={onChange}
            value={value}
            locale="he-IL"
            className="calendar-large"
            tileClassName="rounded-2xl transition-all hover:bg-slate-50 py-4"
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const hasSession = allSessions.some((s: any) => s.date === date.toDateString());
                return hasSession ? <div className="h-1.5 w-1.5 bg-amber-400 rounded-full mx-auto mt-1"></div> : null;
              }
            }}
          />
        </section>

        {/* רשימת פגישות */}
        <section className="space-y-4 w-full">
          <div className="flex justify-between items-center mb-4 px-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">פגישות ליום שנבחר</h3>
            <span className="text-xs bg-[#32666d] text-white px-4 py-1.5 rounded-full font-bold shadow-sm">
              {value instanceof Date ? value.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-400 font-medium">טוען מפגשים...</div>
          ) : sessionsForDay.length > 0 ? (
            sessionsForDay.map((session: any) => (
              <div key={`${session.id}-${session.num}`} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
                
                {/* פרטי המפגש */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="bg-[#32666d]/10 p-4 rounded-2xl text-center min-w-[70px] border border-[#32666d]/5">
                    <span className="text-lg font-black text-[#32666d]">{session.time}</span>
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-bold text-[#003643] leading-tight">{session.group}</h4>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">מפגש מספר {session.num}</p>
                    <div className="flex items-center gap-1 text-slate-400 mt-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <p className="text-sm font-medium">{session.location}</p>
                    </div>
                  </div>
                </div>

                {/* כפתורי פעולה מודגשים */}
                <div className="flex gap-3 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => router.push(`/groups/${session.id}/preparation/${session.num}`)}
                    className="py-2.5 px-5 border border-slate-200 rounded-2xl text-[#003643] text-sm font-bold bg-white hover:bg-slate-50 shadow-sm active:scale-95 transition-all"
                  >
                    הכנה
                  </button>
                  
                  <button 
                    onClick={() => router.push(`/groups/${session.id}/session-log/${session.num}`)}
                    className="py-2.5 px-5 border border-slate-200 rounded-2xl text-[#003643] text-sm font-bold bg-white hover:bg-slate-50 shadow-sm active:scale-95 transition-all"
                  >
                    תיעוד
                  </button>

                  <button 
                    onClick={() => router.push(`/groups/${session.id}/ai-summary/${session.num}`)}
                    className="py-2.5 px-5 bg-[#003643] rounded-2xl text-white text-sm font-bold flex items-center gap-2 shadow-lg hover:bg-[#00252e] active:scale-95 transition-all"
                  >
                    <span>סיכום AI</span>
                    <span className="material-symbols-outlined text-sm text-amber-300">auto_awesome</span>
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white/40 rounded-[40px] border-2 border-dashed border-slate-200 mx-2">
              <p className="text-slate-400 font-medium italic text-sm">אין פגישות מתוכננות ליום זה</p>
            </div>
          )}
        </section>
      </main>

      {/* CSS גלובלי ללוח השנה */}
      <style jsx global>{`
        .calendar-large {
          width: 100% !important;
          border: none !important;
          font-family: inherit !important;
        }
        .react-calendar__navigation button {
          font-size: 1.2rem !important;
          font-weight: bold !important;
          color: #003643 !important;
        }
        .react-calendar__month-view__weekdays__weekday {
          color: #32666d !important;
          font-weight: 800 !important;
          text-decoration: none !important;
          padding: 10px 0 !important;
        }
        .react-calendar__tile--active {
          background: #32666d !important;
          border-radius: 16px !important;
          color: white !important;
        }
        .react-calendar__tile--now {
          background: #e6f0f1 !important;
          border-radius: 16px !important;
          color: #32666d !important;
        }
        .react-calendar__tile:hover {
          border-radius: 16px !important;
        }
      `}</style>
    </div>
  );
}