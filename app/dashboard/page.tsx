'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // הנתיב המתוקן

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('מטפל/ת');
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({
    activeGroups: 0,
    totalParticipants: 0,
    weeklyMeetings: 0,
    missingNotes: 0
  });

  // פונקציה למשיכת הנתונים מהשרת
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. קבלת המשתמש המחובר
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserName(user.user_metadata?.full_name || 'ד"ר לוי');

      // 2. משיכת הקבוצות
      const { data: groupsData } = await supabase.from('groups').select('*');

      if (groupsData) {
        setGroups(groupsData);
        setStats({
          activeGroups: groupsData.length,
          totalParticipants: groupsData.reduce((sum, g) => sum + (g.participants_count || 0), 0),
          weeklyMeetings: 0, // ניתן להוסיף לוגיקה לחישוב מפגשים בהמשך
          missingNotes: 0
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-bold text-[#003643]">טוען את GrouPulse...</div>;
  }

  return (
    <div style={{ backgroundColor: '#f7f9fe', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '450px', margin: '0 auto', backgroundColor: '#f7f9fe', minHeight: '100vh', position: 'relative' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#003643', overflow: 'hidden' }}>
                <img src={`https://ui-avatars.com/api/?name=${userName}&background=003643&color=fff`} style={{ width: '100%' }} alt="פרופיל" />
             </div>
             <span style={{ fontWeight: '800', color: '#003643', fontSize: '18px' }}>GrouPulse</span>
          </div>
          <div style={{ display: 'flex', gap: '15px', color: '#003643' }}>
            <span className="material-symbols-outlined cursor-pointer">notifications</span>
            <span className="material-symbols-outlined cursor-pointer">search</span>
          </div>
        </header>

        <main style={{ padding: '20px 20px 120px 20px' }}>
  {/* Welcome Section */}
  <div style={{ textAlign: 'right', marginBottom: '30px' }}>
    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#003643', margin: 0 }}>
      ברוך הבא, {userName}
    </h1>
    <p style={{ color: '#41484b', marginTop: '5px' }}>
      המערכת מעודכנת עם נתוני הקבוצות שלך.
    </p>
  </div>

  {/* Banner - התראות ותזכורות */}
  <div style={{ backgroundColor: '#1e4d5b', borderRadius: '24px', padding: '25px', color: 'white', marginBottom: '30px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginBottom: '15px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.8 }}>התראות ותזכורות</span>
      <span className="material-symbols-outlined" style={{ color: '#b7ecf3' }}>campaign</span>
    </div>
    <p style={{ fontSize: '18px', textAlign: 'right', marginBottom: '20px' }}>
      {groups.length > 0 ? 'יש לך מפגשים קרובים השבוע.' : 'אין לך מפגשים מתוזמנים כרגע. צרי קבוצה חדשה כדי להתחיל.'}
    </p>
    <button style={{ backgroundColor: '#bceafb', color: '#003643', border: 'none', width: '100%', padding: '15px', borderRadius: '15px', fontWeight: 'bold' }}>
      לכל המפגשים
    </button>
  </div>

  {/* Stats Grid */}
  <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#003643', textAlign: 'right', marginBottom: '15px' }}>מדדי פעילות</h2>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
    <StatItem icon="group_work" value={stats.activeGroups} label="קבוצות פעילות" />
    <StatItem icon="groups" value={stats.totalParticipants} label='סה"כ משתתפים' />
    <StatItem icon="calendar_today" value={stats.weeklyMeetings} label="מפגשים השבוע" />
    <StatItem icon="edit_note" value={stats.missingNotes} label="תיעודים חסרים" isError={stats.missingNotes > 0} />
  </div>

  {/* Groups List Header */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
     <button 
        onClick={() => router.push('/groups/new')}
        style={{ backgroundColor: '#003643', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
        + קבוצה חדשה
     </button>
     <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#003643' }}>הקבוצות שלי</h2>
  </div>

  {/* Groups Loop */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
     {groups.length > 0 ? (
       groups.map((group: any) => (
         <GroupCard key={group.id} title={group.name} participants={group.participants_count} />
       ))
     ) : (
       <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '24px', color: '#999', border: '1px solid #f1f4f8' }}>
         <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '10px' }}>folder_open</span>
         <p>עדיין אין קבוצות רשומות במערכת.</p>
       </div>
     )}
  </div>
</main>
        {/* Bottom Nav Bar */}
        <nav style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '450px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', padding: '15px 10px 30px', borderTop: '1px solid #eee', borderRadius: '30px 30px 0 0' }}>
           <NavItem icon="settings" label="הגדרות" />
           <NavItem icon="analytics" label="אנליטיקות" />
           <NavItem icon="calendar_month" label="יומן" />
           <NavItem icon="group" label="הקבוצות שלי" active />
           <NavItem icon="home" label="בית" />
        </nav>
      </div>
    </div>
  );
}

// רכיבי עזר
function StatItem({ icon, value, label, isError }: any) {
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid #f1f4f8' }}>
      <span className="material-symbols-outlined" style={{ color: isError ? '#ba1a1a' : '#003643', opacity: 0.7 }}>{icon}</span>
      <div style={{ fontSize: '28px', fontWeight: '900', color: isError ? '#ba1a1a' : '#003643' }}>{value}</div>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#41484b' }}>{label}</div>
    </div>
  );
}

function GroupCard({ title, participants }: any) {
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f4f8', textAlign: 'right' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#003643', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '13px', color: '#666', margin: '5px 0 0' }}>{participants} משתתפים</p>
    </div>
  );
}

function NavItem({ icon, label, active }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: active ? '#003643' : '#999', cursor: 'pointer' }}>
      <span className="material-symbols-outlined">{icon}</span>
      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{label}</span>
    </div>
  );
}