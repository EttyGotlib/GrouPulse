'use client';

import { useEffect, useState } from 'react';
import { getInstituteDashboardData } from '../../lib/api';
import { Users, Layers, ArrowLeftRight, Plus, FileText } from 'lucide-react';

export default function InstituteDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await getInstituteDashboardData();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || 'נכשלה טעינת נתוני המוסד');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fe] flex items-center justify-center">
        <p className="text-lg font-semibold text-[#003643] animate-pulse">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fe] text-[#181c1f] min-h-screen p-6 md:p-10 dir-rtl text-right" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* באנר עליון חגיגי */}
        <div className="bg-[#003643] text-white rounded-[2rem] p-8 md:p-10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black leading-tight">שלום, מכון פסגות</h1>
            <p className="text-white/80 text-base">המערכות פועלות כסדרן. באפשרותך לצפות בנתוני המנחים והקבוצות המשויכים למוסד.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-initial bg-white text-[#003643] font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> הוסף מטפל
            </button>
            <button className="flex-1 md:flex-initial bg-white/10 text-white font-bold px-6 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <FileText size={18} /> דו"ח יומי
            </button>
          </div>
        </div>

        {/* כרטיסי סטטיסטיקה מהירה */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">מטופלים פעילים במכון</p>
              <p className="text-4xl font-black text-[#003643]">{data?.totalPatients || 0}</p>
              <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">+4 השבוע</span>
            </div>
            <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl">
              <Users size={28} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">קבוצות פעילות</p>
              <p className="text-4xl font-black text-[#003643]">{data?.activeGroups || 0}</p>
              <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">89% הצלחה</span>
            </div>
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
              <Layers size={28} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">מנחים פעילים</p>
              <p className="text-4xl font-black text-[#003643]">{data?.moderators?.length || 0}</p>
              <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">צוות מסור</span>
            </div>
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <ArrowLeftRight size={28} />
            </div>
          </div>
        </div>

        {/* בלוק תוכן מרכזי - מנחים וקבוצות */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* צוות המטפלים / מנחים */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#003643]">צוות המנחים במכון</h2>
              <button className="text-sm font-bold text-[#32666d] hover:underline">הצג את כולם</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.moderators && data.moderators.length > 0 ? (
                data.moderators.map((mod: any) => (
                  <div key={mod.id} className="p-4 border border-zinc-100 rounded-2xl flex items-center justify-between hover:bg-zinc-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-[#003643] font-bold text-lg">
                        {mod.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#003643]">{mod.full_name}</h3>
                        <p className="text-xs text-zinc-500">{mod.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-sm col-span-2 py-4">לא נמצאו מנחים משויכים.</p>
              )}
            </div>
          </div>

          {/* מפתחים וקבוצות שחולקו לאחרונה */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-[#003643]">מטופלים חדשים במכון</h2>
            <p className="text-xs text-zinc-500">סקירה מרוכזת של המטופלים החדשים שנרשמו השבוע לקבוצות המכון.</p>
            
            <div className="space-y-4">
              {/* מקום לרשימת מטופלים עתידית */}
              <div className="p-3 bg-zinc-50 rounded-xl flex items-center justify-between text-sm">
                <span className="font-medium text-[#003643]">אין נתונים זמינים כרגע</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}