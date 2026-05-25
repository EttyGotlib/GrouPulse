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
      setGroups(groups || []);
      setStats(stats || { activeGroups: 0, totalParticipants: 0, weeklyMeetings: 0, missingNotes: 0 });

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

  // מנוע ההתראות המבוסס על הנתונים האמיתיים שלך
  const generateAlerts = () => {
    const alerts = [];

    if (stats.missingNotes > 0) {
      alerts.push({
        text: `יש לך ${stats.missingNotes} מפגשים שממתינים לתיעוד. כדאי להשלים אותם בקרוב.`,
        icon: 'edit_note',
        color: '#ffcc00'
      });
    }

    if (stats.weeklyMeetings > 0) {
      alerts.push({
        text: `מתוזמנים לך ${stats.weeklyMeetings} מפגשים השבוע. ודאי שרשימות הנוכחות מוכנות.`,
        icon: 'calendar_today',
        color: '#b7ecf3'
      });
    }

    if (groups.length === 0 && !loading) {
      alerts.push({
        text: 'נראה שעדיין אין לך קבוצות פעילות. התחילי ביצירת קבוצה חדשה.',
        icon: 'add_circle',
        color: '#b7ecf3'
      });
    }

    if (alerts.length === 0 && !loading) {
      alerts.push({
        text: 'הכל מעודכן! המערכת מסונכרנת ואין לך משימות פתוחות כרגע.',
        icon: 'check_circle',
        color: '#b7ecf3'
      });
    }

    return alerts;
  };

  const currentAlerts = generateAlerts();
  
  return (
    <div style={{ backgroundColor: '#f7f9fe', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f7f9fe', minHeight: '100vh', position: 'relative' }}>
        
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
                {/* התיקון כאן: עטיפת ה-userName ב-encodeURIComponent כדי למנוע את קריסת ה-ByteString */}
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=003643&color=fff`} style={{ width: '100%' }} alt="פרופיל" />
             </div>
             <span style={{ fontWeight: '800', color: '#003643', fontSize: '18px' }}>GrouPulse</span>
          </div>
        </header>

        <main style={{ padding: '40px 20px 140px 20px' }}>
          <div style={{ textAlign: 'right', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#003643', margin: 0 }}>
               ברוך הבא, {userName}
            </h1>
            <p style={{ color: '#41484b', marginTop: '8px', fontSize: '18px' }}>
               המערכת מעודכנת עם נתוני הקבוצות שלך.
            </p>
          </div>

          {/* תיבת ההתראות הדינמית - מיושרת לימין בצורה מושלמת */}
          <div style={{ backgroundColor: '#1e4d5b', borderRadius: '24px', padding: '30px', color: 'white', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start', flexDirection: 'row-reverse', marginBottom: '15px' }}>
              <span className="material-symbols-outlined" style={{ color: '#b7ecf3' }}>campaign</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.8 }}>התראות ותזכורות</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {currentAlerts.map((alert, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: 'row-reverse', justifyContent: 'flex-start' }}>
                  <span className="material-symbols-outlined" style={{ color: alert.color, fontSize: '24px' }}>
                    {alert.icon}
                  </span>
                  <p style={{ fontSize: '18px', textAlign: 'right', margin: 0, opacity: 0.9, lineHeight: '1.4', flex: 1 }}>
                    {alert.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

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
        </main>
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