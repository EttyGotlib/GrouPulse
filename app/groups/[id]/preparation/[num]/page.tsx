"use client";
/**
 * Session preparation page that provides moderators with AI-assisted guidance before
 * a group meeting. Retrieves group details and participant information, generates
 * personalized preparation insights, and presents recommendations to help moderators
 * plan and conduct the upcoming session effectively.
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getGroupDetails } from '../../../../../lib/api';

export default function PreparationPage() {
  const router = useRouter();
  const { id, num } = useParams();

  // State לשמירת שם הקבוצה
  const [groupName, setGroupName] = useState('');

  // משתתפים מהקבוצה
  const [participants, setParticipants] = useState<any[]>([]);

  // AI State
  const [aiPreparation, setAiPreparation] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(true);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const fetchGroupName = async () => {
      if (!id) return;

      try {
        // שימוש בפונקציה הקיימת שלך לשליפת פרטי קבוצה
        const result = await getGroupDetails(id);

        if (result.success && result.group) {
          setGroupName(result.group.name);

          // שליפת משתתפים מהקבוצה
          if (result.group.participants) {
            setParticipants(result.group.participants);
          }
        } else {
          setGroupName("קבוצה לא נמצאה");
        }
      } catch (error) {
        console.error("Error fetching group name:", error);
        setGroupName("שגיאה בטעינה");
      }
    };

    fetchGroupName();
  }, [id]);

  // AI Preparation Analysis
  useEffect(() => {
    const fetchAiPreparation = async () => {
      if (!id || !num || !groupName) return;

      setIsLoadingAi(true);

      try {
        // איסוף מידע ממפגשים קודמים
        const previousSessionsData: any[] = [];

        for (let i = 1; i < Number(num); i++) {
          const summaryCache = localStorage.getItem(`ai_cache_${id}_${i}`);
          const preparationCache = localStorage.getItem(`preparation_cache_${id}_${i}`);

          previousSessionsData.push({
            session: i,
            summary: summaryCache ? JSON.parse(summaryCache) : null,
            preparation: preparationCache ? JSON.parse(preparationCache) : null
          });
        }

        const response = await fetch('/api/gen-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `
            אתה מנוע AI מקצועי להכנת מפגשים קבוצתיים.

            שם הקבוצה: "${groupName}"
            מספר מפגש: "${num}"

            משתתפים:
            ${participants.map((p: any) => p.name || p.fullName || p).join(", ")}

            נתוני מפגשים קודמים:
            ${JSON.stringify(previousSessionsData)}

            החזר JSON תקין בלבד.
            ללא Markdown.
            ללא הסברים נוספים.

            צור המלצות מקצועיות לקראת המפגש בהתאם לקטגוריות בדף.

            בנוסף:
            - נתח את המידע ממפגשים קודמים.
            - נתח סיכומי AI קודמים.
            - נתח הכנות קודמות.
            - עבור כל משתתף תן תזכורת מקצועית אישית למנחה.

            הפורמט חייב להיות בדיוק:

            {
              "sessionFocus": string,
              "recommendedGoals": string[],
              "recommendedInterventions": [
                {
                  "title": string,
                  "description": string,
                  "phase": string
                }
              ],
              "recommendedEquipment": string[],
              "facilitatorTips": string[],
              "riskPoints": string[],
              "participantReminders": [
                {
                  "name": string,
                  "note": string
                }
              ]
            }

            כל הטקסטים בעברית.
            `
          }),
        });

        if (!response.ok) {
          throw new Error("שגיאה בקבלת נתוני AI");
        }

        const result = await response.json();

        if (result.text) {
          const cleanJson = result.text
            .replace(/```json|```/g, "")
            .trim();

          const parsed = JSON.parse(cleanJson);

          setAiPreparation(parsed);

          // שמירת cache
          localStorage.setItem(
            `preparation_cache_${id}_${num}`,
            JSON.stringify(parsed)
          );
        }
      } catch (error) {
        console.error("AI Preparation Error:", error);

        // Fallback Data
        setAiPreparation({
          sessionFocus: "חיזוק תחושת הביטחון והשייכות בקבוצה",

          recommendedGoals: [
            "עידוד שיח פתוח ובטוח בין המשתתפים",
            "חיזוק הקשבה פעילה בזמן שיתוף אישי",
            "זיהוי דפוסי תקשורת חיוביים בקבוצה"
          ],

          recommendedInterventions: [
            {
              title: "מעגל פתיחה רגשי",
              description: "כל משתתף משתף בתחושה מרכזית מהשבוע האחרון.",
              phase: "פתיחה"
            },
            {
              title: "תרגיל הקשבה בזוגות",
              description: "משתתפים יתרגלו הקשבה ללא שיפוטיות במשך 5 דקות לכל צד.",
              phase: "לב המפגש"
            }
          ],

          recommendedEquipment: [
            "קלפי רגשות",
            "טושים צבעוניים",
            "דפי עבודה",
            "רמקול Bluetooth"
          ],

          facilitatorTips: [
            "לשים לב למשתתפים שקטים בתחילת המפגש",
            "לעודד תגובות אמפתיות בין המשתתפים",
            "לאפשר מרחב בטוח ללא ביקורת"
          ],

          riskPoints: [
            "עומס רגשי סביב שיתופים אישיים",
            "קושי של חלק מהמשתתפים להיחשף",
            "דומיננטיות של משתתפים מסוימים"
          ],

          participantReminders: participants.map((p: any) => ({
            name: p.name || p.fullName || p,
            note: "לשים לב לרמת המעורבות וההשתתפות במפגש."
          }))
        });

        setAiError("AI לא זמין כרגע - מוצגים נתוני דמה");
      } finally {
        setIsLoadingAi(false);
      }
    };

    fetchAiPreparation();
  }, [id, num, groupName, participants]);

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen pb-32 font-sans text-[#181c1f]">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex flex-row-reverse justify-between items-center w-full px-6 h-16 border-b border-slate-100">
        <h1 className="font-bold text-lg text-[#003643]">הכנה למפגש</h1>

        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6 flex flex-col gap-8">

        {/* AI Loading */}
        {isLoadingAi && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-[#b7ecf3] border-t-[#003643] rounded-full animate-spin"></div>
            <p className="font-bold text-[#003643]">AI מכין המלצות למפגש...</p>
          </div>
        )}

        {/* AI Error */}
        {aiError && (
          <div className="bg-[#fff7ed] border border-orange-200 text-orange-700 p-4 rounded-2xl text-sm font-medium">
            {aiError}
          </div>
        )}

        {/* AI Focus */}
        {!isLoadingAi && aiPreparation && (
          <section className="bg-[#003643] text-white p-6 rounded-3xl shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined">psychology</span>
              <h3 className="font-bold text-lg">מיקוד AI למפגש</h3>
            </div>

            <p className="text-sm leading-relaxed opacity-90">
              {aiPreparation.sessionFocus}
            </p>
          </section>
        )}

        {/* Section 1: Session Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-50">
            <label className="text-slate-400 text-[11px] font-bold block mb-1 uppercase tracking-wider">
              שם הקבוצה
            </label>

            <h2 className="text-xl font-extrabold text-[#003643] leading-tight">
              {groupName}
            </h2>

            <div className="mt-4 flex items-center gap-2 text-[#32666d]">
              <span className="material-symbols-outlined text-lg">calendar_today</span>

              <span className="text-sm font-semibold">
                {new Date().toLocaleDateString('he-IL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div className="bg-[#003643] text-white p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-4xl font-black">{num}</span>

            <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-1">
              מספר מפגש
            </span>
          </div>
        </section>

        {/* Section 2: Goals */}
        <section className="bg-[#f1f4f8] p-6 rounded-3xl border border-slate-100">
          <div className="flex items-center gap-2 mb-4 border-r-4 border-[#32666d] pr-3">
            <h3 className="text-lg font-bold text-[#003643]">מטרות המפגש</h3>
          </div>

          <div className="space-y-3">

            {(aiPreparation?.recommendedGoals || []).map((goal: string, i: number) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-sm border border-slate-50"
              >
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 text-[#003643] focus:ring-[#003643]"
                />

                <p className="text-sm font-medium text-slate-700">{goal}</p>
              </div>
            ))}

            <input
              type="text"
              placeholder="+ הוספת מטרה חדשה"
              className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm font-bold bg-transparent hover:bg-white transition-all outline-none focus:border-solid focus:border-[#32666d]"
            />
          </div>
        </section>

        {/* Section 3: Interventions */}
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-[#003643] px-1">
            תכנון התערבויות
          </h3>

          {(aiPreparation?.recommendedInterventions || []).map((item: any, i: number) => (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">

                <span className="bg-[#b7ecf3] text-[#164e54] px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                  {item.phase}
                </span>

                <span className="material-symbols-outlined text-slate-300 cursor-pointer">
                  more_horiz
                </span>
              </div>

              <h4 className="font-bold text-[#003643] text-md">
                {item.title}
              </h4>

              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        {/* Section 4: Equipment */}
        <section className="bg-[#e5e8ed] p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-[#003643] mb-4 px-1">
            ציוד ועזרים
          </h3>

          <div className="grid grid-cols-2 gap-3">

            {(aiPreparation?.recommendedEquipment || []).map((item: string, i: number) => (
              <label
                key={i}
                className="flex items-center gap-3 bg-white p-3 rounded-xl cursor-pointer hover:shadow-md transition-all border border-transparent active:scale-95"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-slate-300 text-[#003643] focus:ring-[#003643]"
                />

                <span className="text-xs font-bold text-slate-600">
                  {item}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* AI Tips */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#32666d]">
              tips_and_updates
            </span>

            <h3 className="text-lg font-bold text-[#003643]">
              המלצות AI למנחה
            </h3>
          </div>

          <div className="space-y-3">
            {(aiPreparation?.facilitatorTips || []).map((tip: string, i: number) => (
              <div
                key={i}
                className="bg-[#f7f9fe] rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100"
              >
                {tip}
              </div>
            ))}
          </div>
        </section>

        {/* AI Risk Points */}
        <section className="bg-[#fff7ed] p-6 rounded-3xl border border-orange-100">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-orange-500">
              warning
            </span>

            <h3 className="text-lg font-bold text-[#003643]">
              נקודות רגישות אפשריות
            </h3>
          </div>

          <div className="space-y-3">
            {(aiPreparation?.riskPoints || []).map((risk: string, i: number) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 text-sm text-slate-700 border border-orange-100"
              >
                {risk}
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Reminders */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-[#003643]">
              תזכורות אישיות
            </h3>

            <button className="text-[#32666d] text-xs font-bold underline">
              עריכה
            </button>
          </div>

          <div className="space-y-3">

            {(aiPreparation?.participantReminders || []).map((p: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50"
              >
                <img
                  src={`https://i.pravatar.cc/150?u=${p.name}`}
                  alt={p.name}
                  className="w-12 h-12 rounded-full object-cover bg-slate-100"
                />

                <div className="flex-1">
                  <h5 className="text-sm font-bold text-[#003643]">
                    {p.name}
                  </h5>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.note}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </section>

      </main>

     </div>
  );
}