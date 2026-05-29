'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
// ייבוא פונקציית ה-API שלכן (עדכני את הנתיב לקובץ ה-API במידת הצורך)
import { getParticipantProgress } from '../../../lib/api'; 

export default function ParticipantProfilePage() {
  const router = useRouter();
  const params = useParams();

  // מזהה המשתתף מגיע מה-URL: /participants/[id]
  const participantId = params.id;

  // States
  const [participantName, setParticipantName] = useState('');
  const [progressData, setProgressData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [fallbackActive, setFallbackActive] = useState(false);

  const fetchedRef = useRef(false);

  useEffect(() => {
    const fetchParticipantData = async () => {
      if (!participantId) {
        setLoading(false);
        return;
      }
      
      if (fetchedRef.current) return;
      fetchedRef.current = true;

      try {
        setLoading(true);

        // -------------------------------------------------------------
        // שליפת נתוני המשתתף והתיעודים ישירות מ-Supabase
        // -------------------------------------------------------------
        const res = await getParticipantProgress(participantId);

        if (!res.success || !res.data) {
          throw new Error(res.error || 'נכשלה שליפת נתוני המשתתף מ-Supabase');
        }

        const dbRecords = res.data;

        // 1. שליפת שם המשתתף מתוך התיעוד הראשון (באמצעות ה-Join שביצעתן)
        if (dbRecords.length > 0 && dbRecords[0].Participants) {
          setParticipantName(dbRecords[0].Participants.name_or_code);
        } else {
          setParticipantName(`משתתף #${participantId}`);
        }

        // 2. מיפוי הנתונים מתוך טבלת Individual_Notes למבנה הנדרש בגרף ובכרטיסיות
        const participantRecords = dbRecords.map((record: any) => ({
          session_id: record.session_id,
          created_at: record.created_at,
          attendance: true, // בגלל שזה מגיע מטבלת individual_notes, הוא היה נוכח
          participation_score: record.participation_score || 0,
          engagement_score: record.participation_score || 0, // שימוש בציון הקיים
          content: record.content || '',
        }));

        setProgressData(participantRecords);

        // -------------------------------------------------------------
        // חישובים עבור ה-Prompt של ה-AI
        // -------------------------------------------------------------
        const totalSessions = participantRecords.length;
        const avgParticipation = totalSessions > 0
          ? (participantRecords.reduce((acc, curr) => acc + (curr.participation_score || 0), 0) / totalSessions).toFixed(1)
          : '0';

        // -------------------------------------------------------------
        // בדיקת ה-Cache של ה-AI (נשמר לפי ה-ID של המשתתף)
        // -------------------------------------------------------------
        const aiCacheKey = `participant_ai_${participantId}`;
        const cachedAi = localStorage.getItem(aiCacheKey);
        if (cachedAi) {
          setAnalysis(JSON.parse(cachedAi));
          setLoading(false);
          return;
        }

        // אם אין תיעודים בכלל, אין טעם לפנות ל-AI
        if (totalSessions === 0) {
          setLoading(false);
          return;
        }

        // טיימאאוט ל-AI
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        // -------------------------------------------------------------
        // פנייה ל-AI שלכן לקבלת הניתוח המורחב
        // -------------------------------------------------------------
        const response = await fetch('/api/gen-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `
            אתה אנליסט מקצועי לדינמיקה קבוצתית וטיפול קבוצתי.
            נתח בקצרה משתתף לאורך זמן לפי נתוני מפגשים.
            החזר JSON בלבד. ללא markdown. ללא הסברים נוספים.

            הפורמט חייב להיות בדיוק:
            {
              "overallTrend": string,
              "engagementLevel": string,
              "riskLevel": string,
              "strengths": string[],
              "challenges": string[],
              "recommendation": string,
              "summary": string
            }

            נתונים:
            שם משתתף: ${dbRecords[0]?.Participants?.name_or_code || `#${participantId}`}
            מספר מפגשים מתועדים: ${totalSessions}
            ממוצע השתתפות: ${avgParticipation}

            תיעודים:
            ${participantRecords.map((r) => `מפגש ${r.session_id}:\n${r.content}`).join('\n')}
            `
          })
        });

        clearTimeout(timeout);

        if (!response.ok) throw new Error('Failed generating AI analysis');

        const result = await response.json();
        if (!result.text) throw new Error('No AI text returned');

        const cleanJson = result.text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        const parsedAnalysis = JSON.parse(cleanJson);
        setAnalysis(parsedAnalysis);

        // שמירה ב-Cache כדי לא לבזבז קריאות AI ברענון הבא
        localStorage.setItem(aiCacheKey, JSON.stringify(parsedAnalysis));
      } catch (error: any) {
        console.error(error);
        setFallbackActive(true);
        setErrorMsg(error.message || 'שגיאה בטעינת הנתונים מ-Supabase');
        fetchedRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantData();
  }, [participantId]);

  // ממוצע השתתפות לחישוב בזמן אמת ב-UI
  const avgParticipation = progressData.length > 0 
    ? (progressData.reduce((acc: number, curr: any) => acc + (curr.participation_score || 0), 0) / progressData.length).toFixed(1) 
    : "0";

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', direction: 'rtl' }}>טוען נתונים מ-Supabase...</div>;
  }

  if (fallbackActive) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily: 'Inter, sans-serif' }}>
        <h2>שגיאה בטעינת פרופיל המשתתף</h2>
        <p>{errorMsg}</p>
        <button style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }} onClick={() => router.back()}>חזרה</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif', paddingBottom: '140px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden' }}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participantId}`} alt="avatar" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#003643', fontSize: '18px' }}>Participant Insight</span>
        </div>
        <span className="material-symbols-outlined" style={{ color: '#003643', cursor: 'pointer' }} onClick={() => router.back()}>arrow_forward</span>
      </div>

      {/* Main Container */}
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '30px 40px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'right', marginBottom: '30px' }}>
          <p style={{ color: '#003643', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>ניתוח מעקב</p>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#003643', marginBottom: '10px' }}>
            פרופיל משתתף: {participantName}
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>סקירת התקדמות מתוך התיעודים השמורים בבסיס הנתונים.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <StatCard label="ממוצע מדד השתתפות" value={avgParticipation} />
          <StatCard label="נוכחות במפגשים" value={`${progressData.length} מפגשים`} isTrend={progressData.length > 0} />
        </div>

        {/* AI Section */}
        {analysis && (
          <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#e2f8fc', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: '#003643', fontWeight: 'bold' }}>
                רמת סיכון: {analysis.riskLevel || 'תקין'}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#003643' }}>ניתוח AI מקיף</h3>
            </div>
            
            <p style={{ color: '#41484b', lineHeight: '1.8', marginBottom: '25px', fontSize: '15px' }}>{analysis.summary}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px' }}>
                <h4 style={{ color: '#003643', fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>💪 חוזקות שנצפו</h4>
                {analysis.strengths?.map((s: string, i: number) => <p key={i} style={{ fontSize: '14px', color: '#334155', margin: '4px 0' }}>• {s}</p>)}
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px' }}>
                <h4 style={{ color: '#003643', fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>🎯 אתגרים מרכזיים</h4>
                {analysis.challenges?.map((c: string, i: number) => <p key={i} style={{ fontSize: '14px', color: '#334155', margin: '4px 0' }}>• {c}</p>)}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <h4 style={{ color: '#003643', fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>📋 המלצות והנחיות המשך למנחה</h4>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>{analysis.recommendation}</p>
            </div>
          </div>
        )}

        {/* Graph */}
        <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: '#003643' }}>
              {analysis?.overallTrend ? analysis.overallTrend : 'מגמת שיפור'}
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#003643' }}>גרף התקדמות</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>רמת מעורבות (1-5) לאורך {progressData.length} מפגשים</p>
            </div>
          </div>

          {progressData.length < 2 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
              אין מספיק מפגשים להצגת גרף
            </div>
          ) : (
            <div>
              {/* מיכל ה-SVG של הגרף */}
              <div style={{ height: '200px', width: '100%', position: 'relative', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <svg 
                  viewBox="0 0 500 150" 
                  preserveAspectRatio="none" 
                  style={{ width: '100%', height: '100%', overflow: 'visible' }} 
                >
                  {/* יצירת קו הגרף הדינמי והמעוקל (Bezier Curve) */}
                  <path
                    d={(() => {
                      const widthBetweenPoints = 500 / (progressData.length - 1);
                      
                      // 1. קודם כל נחשב את כל נקודות ה-X וה-Y האמיתיות מימין לשמאל
                      const points = progressData.map((r, i) => {
                        const x = 500 - (i * widthBetweenPoints);
                        const y = 140 - ((r.participation_score - 1) / 4) * 110;
                        return { x, y };
                      });

                      // 2. נבנה את ה-Path בעזרת קימור Bezier חלק
                      let d = `M ${points[0].x} ${points[0].y}`;
                      
                      for (let i = 0; i < points.length - 1; i++) {
                        const p0 = points[i];
                        const p1 = points[i + 1];
                        
                        // קביעת נקודות האחיזה (Control Points) באמצע הדרך בציר ה-X
                        // כדי ליצור החלקה (Smooth transition) בין העליות והירידות
                        const cpX1 = p0.x - (widthBetweenPoints / 2);
                        const cpY1 = p0.y;
                        const cpX2 = p0.x - (widthBetweenPoints / 2);
                        const cpY2 = p1.y;
                        
                        d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                      }
                      
                      return d;
                    })()}
                    fill="none"
                    stroke="#1e4d5b"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* חיווי מספרי הציון בצד ימין */}
                <span style={{ position: 'absolute', right: '-15px', top: '10px', fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace' }}>5</span>
                <span style={{ position: 'absolute', right: '-15px', bottom: '15px', fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace' }}>1</span>
              </div>

              {/* ציר הנקודות והטקסטים בתחתית */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '0 5px', direction: 'rtl' }}>
                {progressData.map((r, i) => {
                  const isFirst = i === 0;
                  const isLast = i === progressData.length - 1;
                  const isMiddle = i === Math.floor(progressData.length / 2) && progressData.length > 2;

                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      {/* הנקודה שעל הציר */}
                      <div style={{ 
                        width: isLast ? '8px' : '4px', 
                        height: isLast ? '8px' : '4px', 
                        borderRadius: '50%', 
                        backgroundColor: isLast ? '#1e4d5b' : '#cbd5e1',
                        outline: isLast ? '4px solid #e2f8fc' : 'none',
                        marginBottom: '8px'
                      }}></div>
                      
                      {/* הטקסט של המפגש */}
                      <span style={{ fontSize: '11px', color: isLast ? '#003643' : '#94a3b8', fontWeight: isLast ? 'bold' : 'normal', height: '15px', whiteSpace: 'nowrap' }}>
                        {(isFirst || isMiddle || isLast) ? `מפגש ${r.session_id}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Records List */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#003643', marginBottom: '20px', textAlign: 'right' }}>ריכוז תיעודים מתוך המפגשים</h2>
          {progressData.length === 0 ? (
            <p style={{ textAlign: 'right', color: '#64748b' }}>לא נמצאו תיעודים בבסיס הנתונים עבור משתתף זה.</p>
          ) : (
            progressData.map((record: any, index: number) => (
              <RecordCard 
                key={index} 
                meeting={`מפגש ${record.session_id}`} 
                date={new Date(record.created_at).toLocaleDateString('he-IL')} 
                text={record.content} 
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, isTrend }: any) {
  return (
    <div style={{ backgroundColor: '#f1f4f8', borderRadius: '20px', padding: '20px', textAlign: 'center' }}>
      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{label}</p>
      <div style={{ fontSize: '20px', fontWeight: '900', color: '#003643', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        {value}
        {isTrend && <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#059669' }}>trending_up</span>}
      </div>
    </div>
  );
}

function RecordCard({ meeting, date, text }: any) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '25px', marginBottom: '15px', borderRight: '6px solid #1e4d5b', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#1e4d5b' }}>{meeting}</div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{date}</div>
      </div>
      <p style={{ fontSize: '15px', color: '#41484b', lineHeight: '1.6', textAlign: 'right' }}>{text || "לא נכתב תיעוד במפגש זה."}</p>
    </div>
  );
}