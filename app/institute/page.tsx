'use client';

import { useState, useEffect } from 'react';
import { Users, Layers, ArrowLeftRight, Megaphone, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
export default function InstituteDashboard() {
  
  // מצבי קבוצה (States) עבור הנתונים האמיתיים
  const [instituteName, setInstituteName] = useState('טוען...');
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeGroups: 0,
    totalModerators: 0
  });
  const [loading, setLoading] = useState(true);

  // נתוני דוגמה שנשארים כרגע עבור ההתראות (עד שתחברי גם אותן לטבלה)
  const [alerts] = useState([
    { id: 1, text: 'המנחה עינב זרו לא מילאה תיעוד מפגש עבור קבוצת "התמודדות עם חרדה א\'" (מפגש 2).', type: 'warning' },
    { id: 2, text: 'מדד הלכידות הקבוצתית בסדנת העצמה עלה ב-15% במפגש האחרון!', type: 'success' },
    { id: 3, text: 'כל מערכות ה-AI מסונכרנות ומפיקות דוחות אנליטיים כסדרן.', type: 'info' }
  ]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. שליפת המשתמש הנוכחי המחובר
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw userError || new Error('No user found');

        // 2. שליפת פרופיל המכון כדי לקבל את השם האמיתי
        // (בהנחה שיש לך טבלת profiles או institutes שבה ה-id שווה ל-user.id)
        const { data: profile, error: profileError } = await supabase
          .from('institutes') 
          .select('name')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          setInstituteName(profile.name);
        } else {
          // גיבוי במידה והשם נשמר תחת user_metadata
          setInstituteName(user.user_metadata?.full_name || user.user_metadata?.institute_name || 'מכון מוסמך');
        }

        // 3. שליפת נתונים סטטיסטיים (ספירת שורות מהטבלאות הרלוונטיות של המכון)
        // הערה: יש לוודא ששמות הטבלאות והעמודות תואמים למבנה ה-DB שלך (למשל סינון לפי institute_id)
        
        // ספירת מטופלים
        const { count: patientsCount, error: pError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('institute_id', user.id);

        // ספירת קבוצות פעילות
        const { count: groupsCount, error: gError } = await supabase
          .from('groups')
          .select('*', { count: 'exact', head: true })
          .eq('institute_id', user.id)
          .eq('status', 'active'); // או לפי הלוגיקה שלך לקבוצה פעילה

        // ספירת מנחים
        const { count: moderatorsCount, error: mError } = await supabase
          .from('moderators')
          .select('*', { count: 'exact', head: true })
          .eq('institute_id', user.id);

        setStats({
          totalPatients: patientsCount || 0,
          activeGroups: groupsCount || 0,
          totalModerators: moderatorsCount || 0
        });

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
      <div className="flex items-center justify-center min-h-screen text-[#003643] font-bold">
        טוען נתונים מהמערכת...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex-1 pb-24" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* באנר עליון חגיגי - מציג שם דינמי מהמסד */}
        <div className="bg-[#003643] text-white rounded-[2rem] p-8 md:p-10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 text-right">
            <h1 className="text-3xl md:text-4xl font-black leading-tight">שלום, {instituteName}</h1>
            <p className="text-white/80 text-base">המערכות פועלות כסדרן. באפשרותך לצפות בנתוני המנחים והקבוצות המשויכים למוסד.</p>
          </div>
        </div>

        {/* תיבת התראות מנהלתיות */}
        <div className="bg-[#1e4d5b] rounded-[1.5rem] p-6 text-white space-y-4">
          <div className="flex items-center gap-2 justify-start flex-row-reverse">
            <Megaphone className="text-[#b7ecf3]" size={22} />
            <span className="text-sm font-bold opacity-0.8">התראות מנהלתיות ותובנות מוסד</span>
          </div>
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => (
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

        {/* כרטיסי סטטיסטיקה דינמיים ואמיתיים */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
          
          {/* כרטיס מטופלים */}
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

          {/* כרטיס קבוצות */}
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

          {/* כרטיס מנחים */}
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