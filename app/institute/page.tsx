'use client';

import { useState } from 'react';
import { Users, Layers, ArrowLeftRight, Megaphone, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function InstituteDashboard() {
  // נתוני דוגמה (Mock Data) עשירים ומתוחכמים בשביל הפרונט-אנד
  const [mockData] = useState({
    totalPatients: 42,
    activeGroups: 5,
    moderators: [
      { id: 1, full_name: 'עינב זרו', email: 'einav@groupulse.com', role: 'MSc. מדעי המחשב' },
      { id: 2, full_name: 'חוי גוטליב', email: 'chavy@groupulse.com', role: 'פסיכותרפיסטית' },
      { id: 3, full_name: 'נדב לוי', email: 'nadav@groupulse.com', role: 'מנחה קבוצות' }
    ],
    groups: [
      { id: 'g1', name: 'התמודדות עם חרדה א\'', moderator: 'עינב זרו', count: 12, status: 'פעילה' },
      { id: 'g2', name: 'סדנת העצמה וביטחון עצמי', moderator: 'חוי גוטליב', count: 8, status: 'פעילה' },
      { id: 'g3', name: 'ויסות רגשי לנוער', moderator: 'נדב לוי', count: 10, status: 'פעילה' },
      { id: 'g4', name: 'קבוצת תמיכה דינמית', moderator: 'עינב זרו', count: 12, status: 'פעילה' }
    ],
    newParticipants: [
      { id: 1, name: 'אברהם כהן', group: 'התמודדות עם חרדה א\'', date: 'היום' },
      { id: 2, name: 'שירה לוי', group: 'ויסות רגשי לנוער', date: 'אתמול' },
      { id: 3, name: 'משה מזרחי', group: 'סדנת העצמה וביטחון עצמי', date: 'לפני יומיים' }
    ],
    alerts: [
      { id: 1, text: 'המנחה עינב זרו לא מילאה תיעוד מפגש עבור קבוצת "התמודדות עם חרדה א\'" (מפגש 2).', type: 'warning', icon: 'alert' },
      { id: 2, text: 'מדד הלכידות הקבוצתית בסדנת העצמה עלה ב-15% במפגש האחרון!', type: 'success', icon: 'trend' },
      { id: 3, text: 'כל מערכות ה-AI מסונכרנות ומפיקות דוחות אנליטיים כסדרן.', type: 'info', icon: 'info' }
    ]
  });

  return (
    <div className="p-6 md:p-10 flex-1 pb-24" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* באנר עליון חגיגי - שונה: הכפתורים הוסרו והטקסט מיושר נקי */}
        <div className="bg-[#003643] text-white rounded-[2rem] p-8 md:p-10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 text-right">
            <h1 className="text-3xl md:text-4xl font-black leading-tight">שלום, מכון פסגות</h1>
            <p className="text-white/80 text-base">המערכות פועלות כסדרן. באפשרותך לצפות בנתוני המנחים והקבוצות המשויכים למוסד.</p>
          </div>
        </div>

        {/* תיבת התראות מנהלתיות למוסד */}
        <div className="bg-[#1e4d5b] rounded-[1.5rem] p-6 text-white space-y-4">
          <div className="flex items-center gap-2 justify-start flex-row-reverse">
            <Megaphone className="text-[#b7ecf3]" size={22} />
            <span className="text-sm font-bold opacity-0.8">התראות מנהלתיות ותובנות מוסד</span>
          </div>
          <div className="flex flex-col gap-3">
            {mockData.alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 flex-row-reverse justify-start">
                {alert.type === 'warning' && <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />}
                {alert.type === 'success' && <TrendingUp className="text-teal-300 shrink-0 mt-0.5" size={20} />}
                {alert.type === 'info' && <CheckCircle className="text-sky-300 shrink-0 mt-0.5" size={20} />}
                <p className="text-base text-right opacity-0.9 leading-relaxed flex-1">
                  {alert.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* כרטיסי סטטיסטיקה מהירה */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between flex-row-reverse">
            <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl">
              <Users size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">מטופלים פעילים במכון</p>
              <p className="text-4xl font-black text-[#003643]">{mockData.totalPatients}</p>
              <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">+4 השבוע</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between flex-row-reverse">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
              <Layers size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">קבוצות פעילות</p>
              <p className="text-4xl font-black text-[#003643]">{mockData.activeGroups}</p>
              <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">89% הצלחה</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between flex-row-reverse">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <ArrowLeftRight size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">מנחים פעילים</p>
              <p className="text-4xl font-black text-[#003643]">{mockData.moderators.length}</p>
              <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">צוות מסור</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}