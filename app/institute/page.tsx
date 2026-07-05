'use client';

import { useState, useEffect } from 'react';
import { Users, Layers, ArrowLeftRight, Megaphone, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getInstituteStats, getRealInstitutionName } from '../../lib/api';

export default function InstituteDashboard() {
  
  const [instituteName, setInstituteName] = useState('טוען...');
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeGroups: 0,
    totalModerators: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setInstituteName(user.user_metadata?.full_name || 'מכון/מוסד');
        }

        const statsData = await getInstituteStats();
        
        if (statsData) {
          setStats({
            totalPatients: statsData.totalPatients || 0,
            activeGroups: statsData.activeGroups || 0,
            totalModerators: statsData.totalModerators || 0
          });
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#003643] font-bold" dir="rtl">
        טוען נתונים מהמערכת...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex-1 pb-24" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="bg-[#003643] text-white rounded-[2rem] p-8 md:p-10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 text-right">
            <h1 className="text-3xl md:text-4xl font-black leading-tight">שלום, {instituteName}</h1>
            <p className="text-white/80 text-base">המערכות פועלות כסדרן. באפשרותך לצפות בנתוני המנחים והקבוצות המשויכים למוסד.</p>
          </div>
        </div>

        {}
        <div className="bg-[#1e4d5b] rounded-[1.5rem] p-6 text-white space-y-4">
          <div className="flex items-center gap-2 justify-start flex-row-reverse">
            <Megaphone className="text-[#b7ecf3]" size={22} />
            <span className="text-sm font-bold opacity-0.8">לוח עדכונים והנחיות לצוות המוסד</span>
          </div>
          <div className="flex flex-col gap-3">
            
            <div className="flex items-start gap-3 flex-row-reverse justify-start">
              <CheckCircle2 className="text-teal-300 shrink-0 mt-0.5" size={20} />
              <p className="text-base text-right opacity-0.9 leading-relaxed flex-1">
                סנכרון הנתונים מול מערכות האנליטיקה המבוססות AI פועל כסדרו ומפיק דוחות שבועיים אוטומטיים עבור כל קבוצות המכון.
              </p>
            </div>

            <div className="flex items-start gap-3 flex-row-reverse justify-start">
              <ShieldCheck className="text-sky-300 shrink-0 mt-0.5" size={20} />
              <p className="text-base text-right opacity-0.9 leading-relaxed flex-1">
                גישת המנחים מאובטחת ומותנית בהפרדת הרשאות מלאה. מנחי המכון רשאים לצפות אך ורק בקבוצות אליהן שובצו באופן רשמי.
              </p>
            </div>

            <div className="flex items-start gap-3 flex-row-reverse justify-start">
              <HelpCircle className="text-amber-300 shrink-0 mt-0.5" size={20} />
              <p className="text-base text-right opacity-0.9 leading-relaxed flex-1">
                נתקלתם בבעיה טכנית או שגיאה בנתוני הטפסים? ניתן לפנות בכל עת לתמיכה הטכנית המוסדית דרך מסך הגדרות המערכת.
              </p>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
          
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between flex-row-reverse">
            <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl">
              <Users size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">מטופלים פעילים במכון</p>
              <p className="text-4xl font-black text-[#003643]">{stats.totalPatients}</p>
              <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">מעודכן בזמן אמת</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between flex-row-reverse">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
              <Layers size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">קבוצות פעילות</p>
              <p className="text-4xl font-black text-[#003643]">{stats.activeGroups}</p>
              <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">בפיקוח המערכת</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between flex-row-reverse">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
              <ArrowLeftRight size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500">מנחים פעילים</p>
              <p className="text-4xl font-black text-[#003643]">{stats.totalModerators}</p>
              <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">צוות מסור</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}