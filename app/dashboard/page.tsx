'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { getDashboardData } from '../../lib/api';

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

  const fetchData = async () => {
    setLoading(true);
    try {
      
      const { groups, stats } = await getDashboardData();
      
      setGroups(groups);
      setStats(stats);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserName(user.user_metadata?.full_name || 'מטפל/ת');

    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div style={{ backgroundColor: '#f7f9fe', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif' }}>
      {/* Container ראשי רחב למחשב */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f7f9fe', minHeight: '100vh', position: 'relative' }}>
        
        {/* Header - מותאם לרוחב המחשב */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '15px 20px', 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(10px)', 
          position: 'sticky', 
          top: 0, 
          zIndex: 100,
          borderBottom: '1px solid #f1f4f8' 
        }}>
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

        <main style={{ padding: '40px 20px 140px 20px' }}>
          {/* Welcome Section */}
          <div style={{ textAlign: 'right', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#003643', margin: 0 }}>
              ברוך הבא, {userName}
            </h1>
            <p style={{ color: '#41484b', marginTop: '8px', fontSize: '18px' }}>
              המערכת מעודכנת עם נתוני הקבוצות שלך.
            </p>
          </div>

          {/* Banner - התראות ותזכורות */}
          <div style={{ backgroundColor: '#1e4d5b', borderRadius: '24px', padding: '30px', color: 'white', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginBottom: '15px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.8 }}>התראות ותזכורות</span>
              <span className="material-symbols-outlined" style={{ color: '#b7ecf3' }}>campaign</span>
            </div>
            <p style={{ fontSize: '20px', textAlign: 'right', marginBottom: '25px', maxWidth: '600px', marginRight: '0', marginLeft: 'auto' }}>
              {groups.length > 0 ? 'יש לך מפגשים קרובים השבוע. כדאי לעבור על רשימת המשתתפים.' : 'אין לך מפגשים מתוזמנים כרגע. צרי קבוצה חדשה כדי להתחיל את הפעילות.'}
            </p>
            <button style={{ backgroundColor: '#bceafb', color: '#003643', border: 'none', padding: '12px 30px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
              לכל המפגשים
            </button>
          </div>

          {/* Stats Grid - עכשיו הוא גמיש: 4 בשורה במחשב, 2 בשורה בטאבלט */}
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#003643', textAlign: 'right', marginBottom: '20px' }}>מדדי פעילות</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '20px', 
            marginBottom: '50px' 
          }}>
            <StatItem icon="group_work" value={stats.activeGroups} label="קבוצות פעילות" />
            <StatItem icon="groups" value={stats.totalParticipants} label='סה"כ משתתפים' />
            <StatItem icon="calendar_today" value={stats.weeklyMeetings} label="מפגשים השבוע" />
            <StatItem icon="edit_note" value={stats.missingNotes} label="תיעודים חסרים" isError={stats.missingNotes > 0} />
          </div>

          {/* Groups List Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
             <button 
                onClick={() => router.push('/groups/new')}
                style={{ backgroundColor: '#003643', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                + קבוצה חדשה
             </button>
             <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#003643' }}>הקבוצות שלי</h2>
          </div>

          {/* Groups Grid - במחשב הן יהיו אחת ליד השנייה */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '20px' 
          }}>
             {groups.length > 0 ? (
               groups.map((group: any) => (
                 <GroupCard key={group.id} title={group.name} participants={group.participants_count} />
               ))
             ) : (
               <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '24px', color: '#999', border: '1px solid #f1f4f8' }}>
                 <span className="material-symbols-outlined" style={{ fontSize: '64px', marginBottom: '15px' }}>folder_open</span>
                 <p style={{ fontSize: '18px' }}>עדיין אין קבוצות רשומות במערכת.</p>
               </div>
             )}
          </div>
        </main>

        {/* Bottom Nav Bar - ממורכז ומוגבל ברוחב גם במחשב */}
        <nav style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%', 
          maxWidth: '500px', 
          backgroundColor: 'white', 
          display: 'flex', 
          justifyContent: 'space-around', 
          padding: '15px 10px 30px', 
          borderTop: '1px solid #eee', 
          borderRadius: '30px 30px 0 0',
          boxShadow: '0 -5px 15px rgba(0,0,0,0.05)'
        }}>
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

function StatItem({ icon, value, label, isError }: any) {
  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', textAlign: 'center', border: '1px solid #f1f4f8', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <span className="material-symbols-outlined" style={{ color: isError ? '#ba1a1a' : '#003643', opacity: 0.7, fontSize: '30px' }}>{icon}</span>
      <div style={{ fontSize: '32px', fontWeight: '900', color: isError ? '#ba1a1a' : '#003643', margin: '5px 0' }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#41484b' }}>{label}</div>
    </div>
  );
}

function GroupCard({ title, participants }: any) {
  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f4f8', textAlign: 'right', transition: 'transform 0.2s', cursor: 'pointer' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#003643', margin: 0 }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', marginTop: '10px' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>{participants} משתתפים</span>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#999' }}>groups</span>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: active ? '#003643' : '#999', cursor: 'pointer' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>{icon}</span>
      <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{label}</span>
    </div>
  );
}