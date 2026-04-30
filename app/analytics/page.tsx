"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [allGroups, setAllGroups] = useState<{id: string, name: string}[]>([]);
  const [groupName, setGroupName] = useState('');
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgCohesion: 0,
    avgEngagement: 0,
    atmosphere: "טובה",
    sessionsData: [] as any[],
    participantStats: [] as any[],
    trends: { cohesion: 'stable', engagement: 'stable', atmosphere: 'stable' }
  });

  useEffect(() => {
    // 1. טעינת רשימת קבוצות
    const groups: {id: string, name: string}[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // בדיקה שהמפתח שייך לנתוני קבוצה
    if (key && key.startsWith('group_data_')) {
        try {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const parsedData = JSON.parse(rawData);
            // חילוץ ה-ID מהמפתח (מסיר את התחילית group_data_)
            const groupId = key.replace('group_data_', '');
            
            groups.push({ 
              id: groupId, 
              name: parsedData.name || "קבוצה ללא שם" 
            });
          }
        } catch (e) {
          console.error("שגיאה בטעינת קבוצה:", key, e);
        }
      }
    }
    setAllGroups(groups);

    if (!id) return;

    // 2. מציאת שם הקבוצה הנבחרת
    const groupRaw = localStorage.getItem(`group_data_${id}`);
    let totalSessionsDefined = 0;
    if (groupRaw) {
      const parsed = JSON.parse(groupRaw);
      setGroupName(parsed.name);
      // לוקח את הנתון המדויק מהגדרת הקבוצה
      totalSessionsDefined = parseInt(parsed.sessionsCount || parsed.totalSessions || "0");
    }

    // 3. איסוף נתונים מכל סיכומי ה-AI של הקבוצה
    let totalCohesion = 0;
    const sessionsFound: any[] = [];
    const participantsMap: Record<string, { sessions: number, totalScore: number }> = {};

    Object.keys(localStorage).forEach(key => {
      if (key.includes('ai_cache') && key.includes(id)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const ai = data.aiResult;
          if (ai && typeof ai.cohesionScore === 'number') {
            const sessionNum = key.split('_').pop();
            sessionsFound.push({
              num: parseInt(sessionNum || "0"),
              label: `מפגש ${sessionNum}`,
              score: ai.cohesionScore,
              h: `${ai.cohesionScore}%`
            });
            totalCohesion += ai.cohesionScore;

            if (Array.isArray(ai.individualHighlights)) {
              ai.individualHighlights.forEach((p: any) => {
                if (!participantsMap[p.name]) participantsMap[p.name] = { sessions: 0, totalScore: 0 };
                participantsMap[p.name].sessions += 1;
                // הערכת מעורבות לפי טקסט (לוגיקה בסיסית לצורך ההמחשה)
                participantsMap[p.name].totalScore += (p.text.length > 20 ? 90 : 70);
              });
            }
          }
        } catch (e) {}
      }
    });

    if (sessionsFound.length > 0) {
      sessionsFound.sort((a, b) => a.num - b.num);
      const last12Sessions = sessionsFound.slice(-12);
      const avgCohesion = Math.round(totalCohesion / sessionsFound.length);
      
      // חישוב מגמה (פשוט: השוואת המפגש האחרון לממוצע)
      const lastScore = sessionsFound[sessionsFound.length - 1].score;
      const cohesionTrend = lastScore > avgCohesion ? 'up' : lastScore < avgCohesion ? 'down' : 'stable';

      setStats({
        avgCohesion,
        avgEngagement: 85, // כרגע קבוע, ניתן לחשב מתוך ה-API בעתיד
        atmosphere: "חיובית ומקדמת",
        sessionsData: last12Sessions,
        participantStats: Object.entries(participantsMap).map(([name, data]) => ({
          name,
          score: Math.round(data.totalScore / data.sessions),
          attendance: Math.round((data.sessions / sessionsFound.length) * 100)
        })),
        trends: { cohesion: cohesionTrend, engagement: 'up', atmosphere: 'stable' }
      });
    }
  }, [id]);

  const TrendIcon = ({ type }: { type: string }) => {
    if (type === 'up') return <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>;
    if (type === 'down') return <span className="material-symbols-outlined text-red-500 text-sm">trending_down</span>;
    return <span className="material-symbols-outlined text-slate-400 text-sm">trending_flat</span>;
  };

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen pb-32 font-sans text-[#181c1f]">
      
      {/* Header */}
      <header className="bg-white px-6 py-5 flex flex-row-reverse justify-between items-center border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#003643] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">insights</span>
          </div>
          <h1 className="font-bold text-[#003643] text-lg">מרכז אנליטיקה</h1>
        </div>
        <button onClick={() => router.push('/dashboard')} 
          className="material-symbols-outlined text-[#003643] p-2 hover:bg-slate-50 rounded-full transition-colors">home
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6 space-y-6">
        
        {/* 1. כרטיסיית בחירת קבוצות */}
        <section className="bg-white rounded-[28px] p-4 shadow-sm border border-slate-50">
          <p className="text-[10px] font-black text-slate-400 mb-3 mr-2 uppercase tracking-widest">הקבוצות שלך</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {allGroups.map((group) => (
              <button 
                key={group.id}
                onClick={() => router.push(`/analytics?id=${group.id}`)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border ${id === group.id ? 'bg-[#003643] text-white' : 'bg-slate-50 text-slate-500 border-transparent'}`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </section>

        {id ? (
          <>
            <div className="text-right px-2 py-2">
              <h2 className="text-3xl font-black text-[#003643]">{groupName}</h2>
              <p className="text-slate-400 text-xs italic">ניתוח ביצועים קבוצתי רב-ממדי</p>
            </div>

            {/* 2. רמת השתתפות לאורך זמן (12 מפגשים) */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 relative overflow-hidden">
              <h3 className="font-bold text-[#003643] mb-8 flex justify-between items-center">
                רמת השתתפות לאורך התקופה          
                <TrendIcon type={stats.trends.engagement} />           
              </h3>
              
              <div className="text-sm font-bold opacity-90 mt-1 mb-8">
                ניתוח מעורבות ב-({stats.sessionsData.filter(s => s.score).length}) המפגשים שהוזנו
              </div>

              <div className="flex justify-between items-end h-44 gap-2">
                {stats.sessionsData.map((bar, i) => {
                    
                  const isFilled = bar.score;
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 flex-1 min-w-[20px]">
                      <div 
                        className={`w-full h-32 relative rounded-t-lg bg-slate-100/50 ${isFilled ? 'cursor-pointer' : ''}`}
                        onClick={() => isFilled && setSelectedBar(bar.label)}
                      >
                        {isFilled ? (
                                    <div 
                                    className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ${selectedBar === bar.label ? 'bg-[#003643]' : 'bg-[#b7ecf3]'}`} 
                                    style={{ height: bar.h }}
                                    />
                                ) : (
                                    /* עמודה שווה לאפס עבור NULL */
                                    <div 
                                    className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700s" 
                                    style={{ height: '4px' }}
                                    />
                                )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center h-6">
                {selectedBar && <span className="text-xs font-bold text-[#003643] animate-pulse">{selectedBar}</span>}
              </div>
            </section>

            {/* 3. כרטיס לכידות קבוצתית */}
            {/* כרטיס לכידות קבוצתית - מבנה חדש לפי התמונה */}
            <section className="bg-[#003643] rounded-[32px] p-10 text-white shadow-xl relative overflow-hidden min-h-[220px] flex flex-col justify-between">
            
            {/* שורה עליונה: אחוז ומגמה מול אייקון */}
            <div className="flex justify-between items-start">
                <div className="text-right">
                <div className="text-6xl font-black tracking-tighter">{stats.avgCohesion}%</div>
                <div className="text-sm font-bold opacity-90 mt-1">
                    {stats.trends.cohesion === 'up' ? 'מגמת עלייה' : 
                    stats.trends.cohesion === 'down' ? 'מגמת ירידה' : 'מגמה יציבה'}
                </div>
                </div>
                
                {/* אייקון קבוצה (דומה לתמונה) */}
                <div className="opacity-40">
                <div className="flex justify-between mb-2">
                  <span className="material-symbols-outlined text-[#32666d]">diversity_10</span>
                  
                </div>
                </div>
            </div>

            {/* כותרת תחתונה */}
            <div className="text-right mt-4">
                <h3 className="text-3xl font-black">לכידות קבוצתית</h3>
            </div>

            {/* פס התקדמות בתחתית הכרטיס */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-6">
                <div 
                className="h-full bg-[#b7ecf3] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.avgCohesion}%` }}
                ></div>
            </div>
            </section>

            {/* 4. שתי כרטיסיות (מעורבות ואווירה) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50">
                
                <h4 className="text-slate-400 text-[10px] font-bold uppercase">מעורבות כללית</h4>
                <div className="text-2xl font-black text-[#003643]">{stats.avgEngagement}%</div>
              </div>
              
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50">
                <div className="flex justify-between mb-2">
                  <span className="material-symbols-outlined text-[#32666d]">mood</span>
                  <TrendIcon type={stats.trends.atmosphere} />
                </div>
                <h4 className="text-slate-400 text-[10px] font-bold uppercase">אווירה</h4>
                <div className="text-sm font-black text-[#003643] truncate">{stats.atmosphere}</div>
              </div>
            </div>

            {/* 5+6. אנליטיקה לפי משתתפים */}
            <section className="pt-4 space-y-4">
              <h2 className="text-xl font-black text-[#003643] mr-2">אנליטיקה לפי משתתפים</h2>
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 space-y-5">
                {stats.participantStats.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#003643] text-xs">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm">{p.name}</span>
                        <span className="text-[10px] text-slate-400">{p.attendance}% נוכחות</span>
                      </div>
                      <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#32666d] h-full" style={{ width: `${p.score}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 7+8. זיהוי דפוסים */}
            <section className="pt-4 space-y-4 pb-10">
              <h2 className="text-xl font-black text-[#003643] mr-2">זיהוי דפוסים (AI Insights)</h2>
              <div className="grid gap-3">
                <div className="bg-green-50/50 border border-green-100 p-6 rounded-[28px] flex gap-4">
                  <span className="material-symbols-outlined text-green-600">verified</span>
                  <div>
                    <h4 className="font-bold text-green-900 text-sm">נקודות לשימור</h4>
                    <p className="text-green-700/80 text-xs mt-1">רמת פתיחות גבוהה ושיח רגשי יציב לאורך המפגשים האחרונים.</p>
                  </div>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[28px] flex gap-4">
                  <span className="material-symbols-outlined text-blue-600">trending_up</span>
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">נקודות לחיזוק</h4>
                    <p className="text-blue-700/80 text-xs mt-1">עידוד משתתפים פסיביים יותר לקחת חלק בשיח הקבוצתי.</p>
                  </div>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[28px] flex gap-4">
                  <span className="material-symbols-outlined text-amber-600">build</span>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">נקודות לשיפור</h4>
                    <p className="text-amber-700/80 text-xs mt-1">איזון זמני הדיבור בין המשתתפים הדומיננטיים לאחרים.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">leaderboard</span>
            <p className="text-slate-400 font-medium italic">בחר קבוצה כדי לצפות בנתונים</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-[#003643]">מנתח נתונים...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}