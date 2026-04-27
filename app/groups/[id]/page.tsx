'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function GroupDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif', paddingBottom: '120px' }}>
      
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <span className="material-symbols-outlined" style={{ color: '#003643', cursor: 'pointer' }}>more_vert</span>
        <span style={{ fontWeight: 'bold', color: '#003643', fontSize: '18px' }}>קבוצת תמיכה: התמודדות עם חרדה</span>
        <span className="material-symbols-outlined" style={{ color: '#003643', cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>arrow_forward</span>
      </div>

      {/* Main Content Container - Desktop Width */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '30px 40px' }}>
        
        {/* Top Section: Hero & Schedule */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '30px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#003643', marginBottom: '15px' }}>קבוצת תמיכה: התמודדות עם חרדה</h1>
            <p style={{ color: '#41484b', fontSize: '16px', lineHeight: '1.6', marginBottom: '25px' }}>
              מרחב בטוח לשיתוף ועיבוד חוויות רגשיות, הקניית כלים לוויסות עצמי ותמיכה הדדית בסביבה קלינית מבוקרת.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ backgroundColor: '#cff0f6', color: '#003643', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span> קבוצה פעילה
              </div>
              <div style={{ backgroundColor: '#f1f4f8', color: '#64748b', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span> 12 משתתפים
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#003643', borderRadius: '24px', padding: '30px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>לו"ז מפגשים</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ opacity: 0.8 }}>calendar_month</span>
              <span style={{ fontSize: '16px' }}>כל יום שני</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ opacity: 0.8 }}>schedule</span>
              <span style={{ fontSize: '16px' }}>18:00 - 19:30</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ opacity: 0.8 }}>location_on</span>
              <span style={{ fontSize: '16px' }}>קליניקה רמת אביב</span>
            </div>
          </div>
        </div>

        {/* Participants Section */}
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
            <ParticipantCard id="1" name="רחל לוי" info="הצטרפה לפני חודשיים" router={router} />
            <ParticipantCard id="2" name="אברהם כהן" info="הצטרף לפני חודש" router={router} />
            <ParticipantCard id="3" name="שרה ישראלי" info="הצטרפה השבוע" router={router} />
            <ParticipantCard id="4" name="דוד אהרוני" info="הצטרף לפני 3 חודשים" router={router} />
          </div>
        </div>

        {/* Meetings Management */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#003643', marginBottom: '25px' }}>ניהול מפגשים</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            <MeetingCard date="24 מרץ" title="מפגש 12: ויסות רגשי" status="הושלם • 12/12 נוכחים" />
            <MeetingCard date="01 אפריל" title="מפגש 13: חשיפה הדרגתית" status="מפגש הבא • בעוד 6 ימים" isNext />
            <MeetingCard date="17 מרץ" title="מפגש 11: מנגנוני הגנה" status="הושלם • 10/12 נוכחים" />
          </div>
        </div>
      </div>
    </div>
  );
}

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

function MeetingCard({ date, title, status, isNext }: any) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: isNext ? '2px solid #cff0f6' : '1px solid #f1f4f8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
         <div style={{ textAlign: 'center', backgroundColor: '#f1f4f8', padding: '12px', borderRadius: '18px', minWidth: '60px' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{date.split(' ')[1]}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#003643' }}>{date.split(' ')[0]}</div>
         </div>
         <div style={{ textAlign: 'right', flex: 1, marginRight: '20px' }}>
            <div style={{ fontWeight: 'bold', color: '#003643', fontSize: '17px' }}>{title}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{status}</div>
         </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ flex: 1, padding: '12px', borderRadius: '14px', border: '1px solid #e1e8ed', backgroundColor: isNext ? '#003643' : 'white', color: isNext ? 'white' : '#003643', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>הכנה למפגש</button>
          <button style={{ flex: 1, padding: '12px', borderRadius: '14px', border: '1px solid #e1e8ed', backgroundColor: '#f8fafc', color: '#475569', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>תיעוד המפגש</button>
        </div>
        <button style={{ width: '100%', padding: '12px', borderRadius: '14px', border: 'none', backgroundColor: '#1e4d5b', color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>סיכום AI</button>
      </div>
    </div>
  );
}