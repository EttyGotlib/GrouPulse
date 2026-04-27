'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getGroupDetails } from '../../../lib/api';

export default function GroupDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  
  // State לאחסון הנתונים האמיתיים
  const [groupData, setGroupData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (id) {
        const result = await getGroupDetails(id);
        if (result.success) {
          setGroupData(result.group);
          setParticipants(result.participants);
        }
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>טוען נתונים...</div>;
  if (!groupData) return <div style={{ textAlign: 'center', marginTop: '50px' }}>קבוצה לא נמצאה</div>;

  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif', paddingBottom: '120px' }}>
      
      {/* 1. Header - השם כעת מגיע מה-DB */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <span className="material-symbols-outlined" style={{ color: '#003643', cursor: 'pointer' }}>more_vert</span>
        <span style={{ fontWeight: 'bold', color: '#003643', fontSize: '18px' }}>{groupData.description}: {groupData.name}</span>
        <span className="material-symbols-outlined" style={{ color: '#003643', cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>arrow_forward</span>
      </div>

      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '30px 40px' }}>
        
        {/* Top Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '30px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#003643', marginBottom: '15px' }}>{groupData.name}</h1>
            <p style={{ color: '#41484b', fontSize: '16px', lineHeight: '1.6', marginBottom: '25px' }}>
              {groupData.description} - מרחב בטוח לשיתוף ועיבוד חוויות רגשיות, הקניית כלים לוויסות עצמי ותמיכה הדדית בסביבה קלינית מבוקרת.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ backgroundColor: '#cff0f6', color: '#003643', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span> קבוצה פעילה
              </div>
              <div style={{ backgroundColor: '#f1f4f8', color: '#64748b', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span> {participants.length} משתתפים
              </div>
            </div>
          </div>

          {/* לוח זמנים (נשאר סטטי בינתיים כי אין עמודות לזה ב-DB) */}
          <div style={{ backgroundColor: '#003643', borderRadius: '24px', padding: '30px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>לו"ז מפגשים</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ opacity: 0.8 }}>calendar_month</span>
              <span style={{ fontSize: '16px' }}>כל יום שני</span>
            </div>
            {/* ... שאר הלו"ז ... */}
          </div>
        </div>

        {/* Participants Section - כאן הרשימה הופכת לאמיתית! */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button 
              onClick={() => router.push('/groups/new/participants')}
              style={{ backgroundColor: '#003643', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '14px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined">person_add</span> הוספת משתתף
            </button>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#003643' }}>משתתפי הקבוצה</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px' }}>
            {participants.length > 0 ? (
              participants.map((p) => (
                <ParticipantCard 
                  key={p.id} 
                  id={p.id} 
                  name={p.name_or_code} 
                  info={p.email || "אין אימייל"} 
                  router={router} 
                />
              ))
            ) : (
              <p style={{ color: '#64748b' }}>עדיין אין משתתפים בקבוצה זו.</p>
            )}
          </div>
        </div>

        {/* ... ניהול מפגשים (אפשר להשאיר סטטי בינתיים) ... */}
      </div>
    </div>
  );
}

// קומפוננטת כרטיס משתתף - משתמשת במידע האמיתי
function ParticipantCard({ id, name, info, router }: any) {
  return (
    <div style={{ minWidth: '160px', backgroundColor: 'white', borderRadius: '20px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid #f1f4f8' }}>
      <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e2e8f0', margin: '0 auto 12px', overflow: 'hidden' }}>
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" style={{ width: '100%' }} />
      </div>
      <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#003643' }}>{name}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', margin: '5px 0 12px' }}>{info}</div>
      
      <button 
        onClick={() => router.push(`/participants/${id}`)}
        style={{ color: '#003643', border: 'none', background: 'none', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
      >
        פרופיל מלא
      </button>
    </div>
  );
}