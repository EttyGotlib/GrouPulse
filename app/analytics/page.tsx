"use client";
/**
 * AnalyticsPage Component
 * * A Next.js client-side component that handles multi-dimensional group analytics and reporting.
 * It fetches group data dynamically from both backend APIs (supporting institute and regular user roles)
 * and local storage backups, computing aggregate metrics for cohesion, session engagement, and participant 
 * attendance trends. Features interactive UI data visualization bars, automated AI pattern insights, 
 * responsive layouts wrapped in React Suspense, and print-optimized styling configurations for seamless 
 * PDF generation.
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getGroupDetails, getDashboardData, getRealInstituteDashboardRealData } from '../../lib/api';

import { supabase } from '../../lib/supabase'; 
import InstituteNav from '../../components/ui/InstituteNav'; 

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const userType = searchParams.get('userType'); 
  
  const [allGroups, setAllGroups] = useState<{id: string, name: string}[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgCohesion: 0,
    lastCohesion: 0,
    cohesionDeltaPercent: 0,
    avgEngagement: 0,
    atmosphere: "טובה",
    patternInsights: {
      preserve: "אין מספיק נתונים לקביעה.",
      strengthen: "נדרש עוד תיעוד כדי לזהות דפוס חיזוק.",
      improve: "נדרש עוד תיעוד כדי לזהות דפוס לשיפור."
    },
    sessionsData: [] as any[],
    participantStats: [] as any[],
    trends: { cohesion: 'stable', engagement: 'stable', atmosphere: 'stable' }
  });

 
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      setError('');
      const fetchGroups = async () => {
        let serverGroups: {id: string, name: string}[] = [];
        let localGroups: {id: string, name: string}[] = [];

      
        if (userType === 'institute') {
          try {
            
            const response = await getRealInstituteDashboardRealData();
            if (response && response.success && response.data?.groups) {
              serverGroups = response.data.groups.map((g: any) => ({
                id: g.id.toString(),
                name: g.name
              }));
            }
          } catch (e) {
            console.error("שגיאה במשיכת קבוצות המוסד מה-API:", e);
          }
          
          setAllGroups(serverGroups);
          return; 
        }

        
        try {
          const response = await getDashboardData();
          if (response && response.groups) {
            serverGroups = response.groups.map((g: any) => ({
              id: g.id.toString(),
              name: g.name
            }));
          }
        } catch (e) {
          console.error("שגיאה במשיכת קבוצות המנחה מהשרת:", e);
        }

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('group_data_')) {
            try {
              const rawData = localStorage.getItem(key);
              if (rawData) {
                const parsedData = JSON.parse(rawData);
                localGroups.push({ 
                  id: key.replace('group_data_', ''), 
                  name: parsedData.name || "קבוצה ללא שם" 
                });
              }
            } catch (e) { console.error(e); }
          }
        }

        const combined = [...serverGroups];
        localGroups.forEach(localG => {
          if (!combined.find(serverG => serverG.id === localG.id)) {
            combined.push(localG);
          }
        });

        setAllGroups(combined);
      };
      fetchGroups();
            
      if (!id) {
        setLoading(false);
        return;
      }

      let currentParticipantNames: string[] | null = null;
      let totalSessionsCount = 0;
      try {
        const groupDetails = await getGroupDetails(id);
        if (groupDetails.success) {
          setGroupName(groupDetails.group?.name || '');
          currentParticipantNames = (groupDetails.participants || []).map((p: any) => p.name_or_code).filter(Boolean);
          totalSessionsCount = Number(groupDetails.group?.session_count || 0);
        } else {
          setError('לא הצלחנו למשוך נתונים עדכניים מהשרת.');
        }
      } catch (e) {
        console.error("שגיאה בשליפת נתוני קבוצה:", e);
        setError('אירעה שגיאה בטעינת הנתונים מהשרת.');
      }

      let totalCohesion = 0;
      const sessionsFound: any[] = [];
      const participantsPresenceMap: Record<string, { presentCount: number }> = {};
      const allowedParticipantNames = currentParticipantNames ? new Set(currentParticipantNames) : null;
      if (allowedParticipantNames) {
        allowedParticipantNames.forEach((name) => {
          participantsPresenceMap[name] = { presentCount: 0 };
        });
      }
      let heldSessionsCount = 0;
      let totalEngagementComposite = 0;
      let engagementSessionsCount = 0;
      let lastEngagementComposite = 0;
      let totalAtmosphereScore = 0;
      let atmosphereSessionsCount = 0;
      const aiInsightsPool: string[] = [];

      Object.keys(localStorage).forEach(key => {
        if (key.includes('ai_cache') && key.includes(id)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const ai = data.aiResult;
            if (ai && typeof ai.cohesionScore === 'number') {
              const sessionNum = key.split('_').pop();
              sessionsFound.push({
                num: parseInt(sessionNum || "0", 10),
                label: `מפגש ${sessionNum}`,
                score: ai.cohesionScore,
                h: `${ai.cohesionScore}%`
              });
              totalCohesion += ai.cohesionScore;
              if (Array.isArray(ai.insights)) {
                ai.insights.forEach((insight: any) => {
                  if (typeof insight === 'string' && insight.trim()) {
                    aiInsightsPool.push(insight.trim());
                  }
                });
              }
            }
          } catch (e) {
            console.warn("שגיאה בקריאת ai_cache:", key, e);
          }
        }
      });

      Object.keys(localStorage).forEach((key) => {
        if (!key.startsWith(`session_log_${id}_`)) return;
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || '{}');
          const atmosphereLabel = parsed?.atmosphere;
          const atmosphereScore = atmosphereLabel === 'תומכת' ? 100 : atmosphereLabel === 'ניטרלית' ? 60 : atmosphereLabel === 'מתוחה' ? 20 : null;
          if (atmosphereScore !== null) {
            totalAtmosphereScore += atmosphereScore;
            atmosphereSessionsCount += 1;
          }

          const attendanceList = Array.isArray(parsed?.attendance) ? parsed.attendance : [];
          if (attendanceList.length === 0) return;

          heldSessionsCount += 1;
          const engagementLabel = parsed?.engagement;
          const engagementFromLabel = engagementLabel === 'אינטנסיבית' ? 100 : engagementLabel === 'מאוזנת' ? 70 : engagementLabel === 'פאסיבית' ? 40 : 0;

          const presentParticipants = attendanceList.filter((person: any) => person?.present === true);
          const engagementFromParticipants = presentParticipants.length > 0
            ? Math.round(
                presentParticipants.reduce((sum: number, person: any) => {
                  const participationLevel = Number(person?.participationLevel || 0);
                  const levelScore = Math.max(0, Math.min(5, participationLevel)) * 20;
                  const noteLength = (person?.notes || '').trim().length;
                  const notesBonus = noteLength > 15 ? 10 : noteLength > 0 ? 5 : 0;
                  return sum + Math.min(100, levelScore + notesBonus);
                }, 0) / presentParticipants.length
              )
            : 0;

          const sessionEngagementScore = Math.round((engagementFromLabel * 0.5) + (engagementFromParticipants * 0.5));
          totalEngagementComposite += sessionEngagementScore;
          engagementSessionsCount += 1;
          lastEngagementComposite = sessionEngagementScore;

          attendanceList.forEach((person: any) => {
            const participantName = person?.name;
            if (!participantName || (allowedParticipantNames && !allowedParticipantNames.has(participantName))) return;
            if (!participantsPresenceMap[participantName]) participantsPresenceMap[participantName] = { presentCount: 0 };
            if (person.present === true) participantsPresenceMap[participantName].presentCount += 1;
          });
        } catch (e) {
          console.warn("שגיאה בקריאת session_log:", key, e);
        }
      });

      const avgEngagement = engagementSessionsCount > 0 ? Math.round(totalEngagementComposite / engagementSessionsCount) : 0;
      const avgAtmosphereScore = atmosphereSessionsCount > 0 ? Math.round(totalAtmosphereScore / atmosphereSessionsCount) : 0;
      const computedAtmosphere = avgAtmosphereScore >= 85 ? 'תומכת מאוד' : avgAtmosphereScore >= 65 ? 'תומכת' : avgAtmosphereScore >= 45 ? 'מאוזנת' : avgAtmosphereScore == 0 ? ' ' : 'מתוחה';
      
      const engagementTrend = engagementSessionsCount > 0 ? (lastEngagementComposite > avgEngagement ? 'up' : lastEngagementComposite < avgEngagement ? 'down' : 'stable') : 'stable';
      
      const preserveText = avgEngagement >= 75 ? "נשמרת מעורבות קבוצתית עקבית ורמת השתתפות פעילה ברוב המפגשים." : avgEngagement >= 55 ? "קיים בסיס יציב לשיח קבוצתי, עם נוכחות ומעורבות סדירה בחלק ניכר מהמפגשים." : "חסר נתונים לניתוח.";
      const strengthenText = aiInsightsPool.length > 0 ? aiInsightsPool[0] : "חסר נתונים לניתוח.";
      const improveText = avgAtmosphereScore < 45 ? "חסר נתונים לניתוח" : avgEngagement < 60 ? "נדרש לשפר חלוקת זמן דיבור ולעודד משתתפים שקטים להביע עמדה באופן עקבי." : "מומלץ לשמר ניטור שיטתי של השתתפות אישית כדי למנוע ירידה הדרגתית במעורבות.";

      if (sessionsFound.length > 0) {
        sessionsFound.sort((a, b) => a.num - b.num);
        const documentedSessionsMap: Record<number, number> = {};
        sessionsFound.forEach((s) => { documentedSessionsMap[s.num] = s.score; });
        const fallbackMaxSession = Math.max(...sessionsFound.map((s) => s.num));
        const totalColumns = Math.max(totalSessionsCount, fallbackMaxSession);
        const allSessionsData = Array.from({ length: totalColumns }, (_, i) => {
          const sessionNumber = i + 1;
          const score = documentedSessionsMap[sessionNumber];
          return { num: sessionNumber, label: `מפגש ${sessionNumber}`, score: typeof score === 'number' ? score : null, h: typeof score === 'number' ? `${score}%` : '0%' };
        });
        const avgCohesion = Math.round(totalCohesion / sessionsFound.length);
        const lastScore = sessionsFound[sessionsFound.length - 1].score;
        const cohesionTrend = lastScore > avgCohesion ? 'up' : lastScore < avgCohesion ? 'down' : 'stable';
        const cohesionDeltaPercent = avgCohesion > 0 ? Math.round(((lastScore - avgCohesion) / avgCohesion) * 100) : 0;

        setStats({
          avgCohesion,
          lastCohesion: lastScore,
          cohesionDeltaPercent,
          avgEngagement,
          atmosphere: computedAtmosphere,
          patternInsights: { preserve: preserveText, strengthen: strengthenText, improve: improveText },
          sessionsData: allSessionsData,
          participantStats: Object.entries(participantsPresenceMap).map(([name, data]) => ({
            name,
            score: heldSessionsCount > 0 ? Math.round((data.presentCount / heldSessionsCount) * 100) : 0,
            attendance: heldSessionsCount > 0 ? Math.round((data.presentCount / heldSessionsCount) * 100) : 0
          })),
          trends: { cohesion: cohesionTrend, engagement: engagementTrend, atmosphere: 'stable' }
        });
      }
      setLoading(false);
    };
    fetchAndProcessData();
  }, [id]);

  const TrendIcon = ({ type }: { type: string }) => {
    if (type === 'up') return <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>;
    if (type === 'down') return <span className="material-symbols-outlined text-red-500 text-sm">trending_down</span>;
    return <span className="material-symbols-outlined text-slate-400 text-sm">trending_flat</span>;
  };

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen pb-32 font-sans text-[#181c1f] print:bg-white print:pb-0">
      
      {}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      ` }} />
      
      {}
      <header className="bg-white px-6 py-5 flex flex-row-reverse justify-between items-center border-b border-slate-100 sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#003643] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">insights</span>
          </div>
          <h1 className="font-bold text-[#003643] text-lg">מרכז אנליטיקה</h1>
        </div>
        <button onClick={() => router.push(userType === 'institute' ? '/institute' : '/dashboard')} 
          className="material-symbols-outlined text-[#003643] p-2 hover:bg-slate-50 rounded-full transition-colors">home
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6 space-y-6 print:pt-0 print:max-w-full">
        {loading && <div className="bg-[#e6f4f7] text-[#003643] text-sm font-bold rounded-2xl p-4 text-center print:hidden">טוען נתוני אנליטיקה...</div>}
        
        {}
        <section className="bg-white rounded-[28px] p-4 shadow-sm border border-slate-50 print:hidden">
        <p className="text-[10px] font-black text-slate-400 mb-3 mr-2 uppercase tracking-widest">
  {userType === 'institute' || allGroups.length > 0 && !localStorage.getItem(`session_log_${allGroups[0]?.id}_1`) ? 'קבוצות המוסד' : 'הקבוצות שלך'}
</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {allGroups.map((group) => (
              <button 
                key={group.id}
                onClick={() => router.push(`/analytics?id=${group.id}${userType === 'institute' ? '&userType=institute' : ''}`)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border ${id === group.id ? 'bg-[#003643] text-white' : 'bg-slate-50 text-slate-500 border-transparent'}`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </section>

        {id ? (
          <>
            {}
            <div className="hidden print:block text-right mb-8 border-b-2 border-[#003643] pb-4">
                <h2 className="text-2xl font-black text-[#003643]">דוח אנליטיקה תקופתי</h2>
                <p className="text-slate-600 font-bold">קבוצה: {groupName}</p>
                <p className="text-slate-400 text-xs mt-1">הופק ע"י מערכת GrouPulse - {new Date().toLocaleDateString('he-IL')}</p>
            </div>

            <div className="text-right px-2 py-2 print:hidden">
              <h2 className="text-3xl font-black text-[#003643]">{groupName}</h2>
              <p className="text-slate-400 text-xs italic">ניתוח ביצועים קבוצתי רב-ממדי</p>
            </div>

            {}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 relative overflow-hidden print:shadow-none print:border-slate-200">
              <h3 className="font-bold text-[#003643] mb-8 flex justify-between items-center">
                רמת השתתפות לאורך התקופה          
                <TrendIcon type={stats.trends.engagement} />          
              </h3>
              
              <div className="flex justify-between items-end h-44 gap-2">
                {stats.sessionsData.map((bar, i) => {
                  const isFilled = typeof bar.score === 'number';
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 flex-1 min-w-[20px]">
                      <div className={`w-full h-32 relative rounded-t-lg bg-slate-100/50 ${isFilled ? 'cursor-pointer' : ''}`}
                        onClick={() => isFilled && setSelectedBar(bar.label)}>
                        {isFilled && (
                          <div 
                            className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ${selectedBar === bar.label ? 'bg-[#003643]' : 'bg-[#b7ecf3]'}`} 
                            style={{ height: bar.h, backgroundColor: selectedBar === bar.label ? '#003643' : '#b7ecf3' }} 
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {}
            <section className="bg-[#003643] rounded-[32px] p-10 text-white shadow-xl relative overflow-hidden min-h-[220px] flex flex-col justify-between print:bg-[#003643]">
                <div className="flex justify-between items-start">
                    <div className="text-right">
                        <div className="text-6xl font-black tracking-tighter">
                          {stats.cohesionDeltaPercent > 0 ? '+' : ''}{stats.cohesionDeltaPercent}%
                        </div>
                        <div className="text-sm font-bold opacity-90 mt-1">
                            {stats.trends.cohesion === 'up' ? 'מגמת עלייה' : stats.trends.cohesion === 'down' ? 'מגמת ירידה' : 'מגמה יציבה'}
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-white/20 text-6xl">diversity_10</span>
                </div>
                <h3 className="text-3xl font-black mt-4">לכידות קבוצתית</h3>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-6">
                    <div className="h-full bg-[#b7ecf3]" style={{ width: `${Math.max(0, Math.min(100, Math.abs(stats.cohesionDeltaPercent)))}%`, backgroundColor: '#b7ecf3' }} />
                </div>
            </section>

            {/}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 print:border-slate-200">
                <h4 className="text-slate-400 text-[10px] font-bold uppercase">מעורבות כללית</h4>
                <div className="text-2xl font-black text-[#003643]">{stats.avgEngagement}%</div>
              </div>
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 relative print:border-slate-200">
                <h4 className="text-slate-400 text-[10px] font-bold uppercase">אווירה</h4>
                <div className="text-sm font-black text-[#003643]">{stats.atmosphere}</div>
              </div>
            </div>

            {}
            <section className="pt-4 space-y-4">
              <h2 className="text-xl font-black text-[#003643] mr-2">אנליטיקה לפי משתתפים</h2>
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 space-y-5 print:shadow-none print:border-slate-200">
                {stats.participantStats.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#003643] text-xs print:border print:border-slate-200">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm">{p.name}</span>
                        <span className="text-[10px] text-slate-400">{p.attendance}% נוכחות</span>
                      </div>
                      <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#32666d] h-full" style={{ width: `${p.attendance}%`, backgroundColor: '#32666d' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {}
            <section className="pt-4 space-y-4 pb-10">
              <h2 className="text-xl font-black text-[#003643] mr-2 print:mt-10">זיהוי דפוסים (AI Insights)</h2>
              <div className="grid gap-3">
                <div className="bg-green-50/50 border border-green-100 p-6 rounded-[28px] flex gap-4 print:bg-white print:border-slate-200">
                  <span className="material-symbols-outlined text-green-600 print:hidden">verified</span>
                  <div>
                    <h4 className="font-bold text-green-900 text-sm">נקודות לשימור</h4>
                    <p className="text-green-700/80 text-xs mt-1">{stats.patternInsights.preserve}</p>
                  </div>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[28px] flex gap-4 print:bg-white print:border-slate-200">
                  <span className="material-symbols-outlined text-blue-600 print:hidden">trending_up</span>
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">נקודות לחיזוק</h4>
                    <p className="text-blue-700/80 text-xs mt-1">{stats.patternInsights.strengthen}</p>
                  </div>
                </div>
              </div>
            </section>

            {}
            <button 
                onClick={handlePrint}
                className="w-full bg-[#003643] text-white py-5 rounded-[24px] font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all print:hidden mt-6 mb-20"
            >
                <span className="material-symbols-outlined">description</span>
                הורדת דוח PDF מלא
            </button>
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">leaderboard</span>
            <p className="text-slate-400 font-medium italic">בחר קבוצה כדי לצפות בנתונים</p>
          </div>
        )}
        </main>
  
        {}
        {userType === 'institute' && (
          <style dangerouslySetInnerHTML={{ __html: `
            /* מסתיר את הסרגל התחתון הכללי של המנחה שמגיע מה-Layout */
            nav, footer, [class*="Navbar"], [class*="navbar"] {
              display: none !important;
            }
          ` }} />
        )}
  
        {}
        {userType === 'institute' && <InstituteNav />}
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