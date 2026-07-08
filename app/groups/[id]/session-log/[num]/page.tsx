"use client";
/**
 * SessionLogPage Component
 *
 * This page manages a full session logging system for group meetings.
 * It loads session data from localStorage or backend APIs, allows real-time editing,
 * tracks group-level metrics (cohesion, engagement, atmosphere), and maintains
 * individual participant attendance, participation scores, and notes.
 *
 * Features:
 * - Auto-loading of session data from localStorage or remote APIs
 * - Merging of group details with individual participant notes
 * - Editable session summary and group dynamics metrics
 * - Attendance tracking per participant
 * - Per-person participation scoring (1–5 scale)
 * - Individual notes per participant
 * - Auto-saving to localStorage on every update
 * - Final persistence to backend on save action
 *
 * Dependencies:
 * React, Next.js router, and custom API utilities for group/session data management.
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getGroupDetails ,saveIndividualNotes, saveSessionSummary,getSessionSummary,getIndividualNotesBySession} from '../../../../../lib/api';

export default function SessionLogPage() {
  const router = useRouter();
  const { id, num } = useParams();
  
  // מפתח ייחודי לשמירה בדפדפן
  const storageKey = `session_log_${id}_${num}`;

  // State לניהול הנתונים
  const [logText, setLogText] = useState('');
  const [cohesion, setCohesion] = useState('');
  const [engagement, setEngagement] = useState('');
  const [atmosphere, setAtmosphere] = useState('');
  
// 1. אתחול ה-attendance כרשימה ריקה
const [attendance, setAttendance] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        const parsed = JSON.parse(savedData);
        setLogText(parsed.logText || '');
        setCohesion(parsed.cohesion || '');
        setEngagement(parsed.engagement || '');
        setAtmosphere(parsed.atmosphere || '');
        setAttendance(parsed.attendance || []);
      } else {
        const groupResult = await getGroupDetails(id);
        const [summaryResult, notesResult] = await Promise.all([
          getSessionSummary(id, num),
          getIndividualNotesBySession(id, num)
        ]);

        if (groupResult.success && summaryResult.success && notesResult.success) {
          const cohesionMap = { 1: 'נמוכה', 2: 'בינונית', 3: 'גבוהה' };
          const engagementMap = { 1: 'פאסיבית', 2: 'מאוזנת', 3: 'אינטנסיבית' };
          const atmosphereMap = { 1: 'מתוחה', 2: 'ניטרלית', 3: 'תומכת' };

          const summaryData = summaryResult.data;

          const newLogText = summaryData?.summary || '';
          const newCohesion = summaryData ? cohesionMap[summaryData.cohesion] || '' : '';
          const newEngagement = summaryData ? engagementMap[summaryData.engagement] || '' : '';
          const newAtmosphere = summaryData ? atmosphereMap[summaryData.atmosphere] || '' : '';
          

          // עיבוד נוכחות
          const participantsFromDB = groupResult.participants.map((p: any) => ({
            id: p.id,
            name: p.name_or_code,
            present: false,
            notes: '',
            participationLevel: 0
          }));

          const mergedAttendance = participantsFromDB.map((p: any) => {
            const note = notesResult.data?.find((n: any) => n.participant_id === p.id);
            return note ? { 
              ...p, 
              present: true, 
              notes: note.content, 
              participationLevel: note.participation_score 
            } : p;
          });

          setLogText(newLogText);
          setCohesion(newCohesion);
          setEngagement(newEngagement);
          setAtmosphere(newAtmosphere);
          setAttendance(mergedAttendance);
          saveToLocal(newLogText, newCohesion, newEngagement, newAtmosphere, mergedAttendance);
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (id && num) loadInitialData();
}, [id, num, storageKey]);
  // 2. פונקציית עזר לשמירה אוטומטית
  const saveToLocal = (
    newText: string, 
    newCohesion: string, 
    newEngagement: string,
    newAtmosphere: string, 
    newAttendance: any[]) => {
    const dataToSave = {
      logText: newText,
      cohesion: newCohesion,
      engagement: newEngagement,
      atmosphere: newAtmosphere,
      attendance: newAttendance
      
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  };

  // פונקציה לשינוי סטטוס נוכחות
  const toggleAttendance = (index: number) => {
    const updatedAttendance = [...attendance];
    updatedAttendance[index].present = !updatedAttendance[index].present;
    setAttendance(updatedAttendance);
    saveToLocal(logText, cohesion, engagement, atmosphere, updatedAttendance);
  };

  // פונקציה חדשה לעדכון רמת השתתפות (1-5)
  const updateParticipationLevel = (index: number, level: number) => {
    const updatedAttendance = [...attendance];
    updatedAttendance[index].participationLevel = level;
    setAttendance(updatedAttendance);
    saveToLocal(logText, cohesion, engagement, atmosphere, updatedAttendance);
  };

  // פונקציה לעדכון הערה ספציפית למשתתף
  const updateParticipantNotes = (index: number, text: string) => {
    const updatedAttendance = [...attendance];
    updatedAttendance[index].notes = text;
    setAttendance(updatedAttendance);
    saveToLocal(logText, cohesion, engagement, atmosphere, updatedAttendance);
  };

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen text-[#181c1f] font-sans pb-32">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="flex flex-row-reverse justify-between items-center w-full px-6 py-4">
          <button className="material-symbols-outlined text-[#003643]">calendar_today</button>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-lg text-[#003643]">יומן מפגש: {num}</h1>
            <span className="text-xs font-medium text-slate-500">תיעוד דינמיקה קבוצתית</span>
          </div>
          <button onClick={() => router.back()} className="material-symbols-outlined text-[#003643]">arrow_forward</button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 mt-8 space-y-10">
        
        {/* Section 1: Group Documentation */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#003643]">תיעוד קבוצתי</h2>
            <span className="bg-[#b7ecf3] text-[#386c73] px-3 py-1 rounded-full text-xs font-bold">מפגש מס' {num}</span>
          </div>
          
          <div className="bg-white rounded-2xl p-1 shadow-sm ring-1 ring-slate-100">
            <textarea 
              value={logText}
              onChange={(e) => {
                setLogText(e.target.value);
                saveToLocal(e.target.value, cohesion, engagement, atmosphere, attendance);
              }}
              className="w-full min-h-[160px] bg-[#f1f4f8] border-none rounded-xl p-6 focus:ring-0 focus:bg-white transition-all leading-relaxed text-right" 
              placeholder="תאר את מהלך המפגש, תובנות מרכזיות ודינמיקה בין המשתתפים..."
            ></textarea>
          </div>

          {/* Group Metrics */}
          <div className="grid grid-cols-1 gap-4 bg-[#f1f4f8]/50 p-4 rounded-2xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#003643] px-1">מדד לכידות קבוצתית</label>
              <div className="flex gap-2">
                {['נמוכה', 'בינונית', 'גבוהה'].map((val) => (
                  <button 
                    key={val}
                    onClick={() => {
                      setCohesion(val);
                      saveToLocal(logText, val, engagement, atmosphere, attendance);
                    }}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${cohesion === val ? 'bg-[#003643] text-white' : 'bg-white border-slate-200'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#003643] px-1">רמת מעורבות כללית</label>
              <div className="flex gap-2">
                {['פאסיבית', 'מאוזנת', 'אינטנסיבית'].map((val) => (
                  <button 
                    key={val}
                    onClick={() => {
                      setEngagement(val);
                      saveToLocal(logText, cohesion, val, atmosphere, attendance);
                    }}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${engagement === val ? 'bg-[#003643] text-white' : 'bg-white border-slate-200'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#003643] px-1">אווירה כללית</label>
              <div className="flex gap-2">
                {['מתוחה', 'ניטרלית', 'תומכת'].map((val) => (
                  <button 
                    key={val}
                    onClick={() => {
                      setAtmosphere(val);
                      saveToLocal(logText, cohesion, engagement, val, attendance);
                    }}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${atmosphere === val ? 'bg-[#003643] text-white' : 'bg-white border-slate-200'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Attendance Checklist (הוחזר למקומו!) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#003643]">צ'ק-ליסט נוכחות</h2>
          <div className="grid grid-cols-2 gap-3">
            {attendance.map((person, i) => (
              <div 
                key={i} 
                onClick={() => toggleAttendance(i)}
                className={`p-4 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${person.present ? 'bg-[#f1f4f8]' : 'bg-slate-50'}`}
              >
                <span className={`font-medium ${!person.present ? 'text-slate-400' : ''}`}>{person.name}</span>
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
          <div className="space-y-4">
            {attendance.filter(p => p.present).length === 0 ? (
              <p className="text-slate-400 text-sm italic py-4 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                סמן נוכחות כדי להוסיף תיעוד פרטני
              </p>
            ) : (
              attendance.map((person, i) => {
                // מציגים רק אם המשתתף נוכח
                if (!person.present) return null;

                return (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 transition-all animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#b7ecf3] flex items-center justify-center text-[#386c73] font-bold">
                          {person.name.substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#003643]">{person.name}</h3>
                          <p className="text-xs text-green-600 font-medium">נוכח/ת במפגש</p>
                        </div>
                      </div>
                    </div>

                  {/* רכיב בחירת רמת השתתפות 1-5 */}
                  <div className="bg-[#f1f4f8] rounded-2xl p-4 space-y-3">
                      <label className="block text-center text-[#003643] font-bold text-sm">רמת השתתפות במפגש</label>
                      <div className="flex justify-between gap-2 px-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => updateParticipationLevel(i, level)}
                            className={`w-full py-2 rounded-xl font-bold transition-all ${
                              person.participationLevel === level 
                              ? 'bg-[#003643] text-white shadow-md' 
                              : 'bg-white text-slate-400 hover:bg-white/80'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea 
                      value={person.notes}
                      onChange={(e) => updateParticipantNotes(i, e.target.value)}
                      className="w-full bg-[#f1f4f8] border-none rounded-2xl p-5 text-sm leading-relaxed focus:ring-2 focus:ring-[#b7ecf3] focus:bg-white transition-all text-right min-h-[120px] mt-6"                      rows={3}
                      placeholder={`הוסף הערה אישית על ${person.name}...`}
                    ></textarea>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-6">
          <button 
            onClick={async () => {
                // 1. שמירה מקומית ליתר ביטחון
                saveToLocal(logText, cohesion, engagement, atmosphere, attendance);
                const res1 = await saveIndividualNotes(id, num, attendance);
                const res2 = await saveSessionSummary(id, num, {
                  logText,
                  cohesion: cohesion === 'נמוכה' ? 1 : cohesion === 'בינונית' ? 2 : 3, 
                  engagement: engagement === 'פאסיבית' ? 1 : engagement === 'מאוזנת' ? 2 : 3,
                  atmosphere: atmosphere === 'מתוחה' ? 1 : atmosphere === 'ניטרלית' ? 2 : 3
                });
                if (res1.success && res2.success) {
                  //localStorage.removeItem(storageKey);
                  router.push(`/groups/${id}`);
                } else {
                  // אם הייתה שגיאה - מציגים אותה
                  alert("שגיאה בשמירה: " + (res1.error || res2.error));
                }
              }}
              className="w-full py-5 bg-[#003643] text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3"
>
              <span className="material-symbols-outlined">save</span>
              שמור וסגור
          </button>
           
        </div>
      </main>
    </div>
  );
}