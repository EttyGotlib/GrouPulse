'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ParticipantProfilePage() {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif', paddingBottom: '120px' }}>
      
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden' }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
          <span style={{ fontWeight: 'bold', color: '#003643', fontSize: '18px' }}>Participant Insight</span>
        </div>
        <span className="material-symbols-outlined" style={{ color: '#003643', cursor: 'pointer' }} onClick={() => router.back()}>arrow_forward</span>
      </div>

      {/* Main Content Container */}
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '30px 40px' }}>
        
        {/* Title Section */}
        <div style={{ textAlign: 'right', marginBottom: '30px' }}>
          <p style={{ color: '#003643', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>ניתוח מעקב</p>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#003643', marginBottom: '10px' }}>פרופיל משתתף: #4482</h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>סקירת התקדמות רגשית, מעורבות קבוצתית ועמידה ביעדים טיפוליים.</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <StatCard label="תאריך הצטרפות" value="12.01.24" />
          <StatCard label="אחוז נוכחות" value="92%" />
          <StatCard label="מגמה כללית" value="חיובית" isTrend />
        </div>

        {/* Progress Graph Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '32px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', color: '#003643', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1e4d5b' }}></div> מגמת שיפור
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#003643' }}>גרף התקדמות</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>רמת מעורבות (1-5) לאורך 8 מפגשים</p>
            </div>
          </div>
          
          {/* Mock Graph Placeholder */}
          <div style={{ height: '250px', width: '100%', position: 'relative', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '20px' }}>
            {/* SVG Curve Mockup */}
            <svg style={{ position: 'absolute', bottom: '20px', width: '100%', height: '180px' }} viewBox="0 0 1000 200">
              <path d="M0,150 Q150,180 300,100 T600,50 T1000,80" fill="none" stroke="#1e4d5b" strokeWidth="4" />
            </svg>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>מפגש 1</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>מפגש 4</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>מפגש 8</div>
          </div>
        </div>

        {/* Highlight Box (Dark) */}
        <div style={{ backgroundColor: '#003643', borderRadius: '24px', padding: '25px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#cff0f6' }}>verified</span>
          <div style={{ textAlign: 'right', flex: 1, marginRight: '20px' }}>
            <h4 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>נוכחות מלאה</h4>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>הגעה ל-5 מפגשים רצופים ללא איחורים.</p>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '12px', fontSize: '12px' }}>הושלם</div>
        </div>

        {/* Records Summary Section */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button style={{ background: 'none', border: 'none', color: '#003643', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>הצג הכל</button>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#003643' }}>ריכוז תיעודים</h2>
          </div>
          
          <RecordCard 
            meeting="מפגש 12" 
            date="14.05.24" 
            text="השתתפות אקטיבית משמעותית. המשתתף יזם שיחה על קונפליקט אישי מחוץ לקבוצה וקיבל משוב באמפתיה." 
          />
          <RecordCard 
            meeting="מפגש 11" 
            date="07.05.24" 
            text="שיתוף בסיפור אישי מרגש. נצפתה ירידה ברמת ההתנגדות הכללית בהשוואה לתחילת התהליך." 
          />
        </div>

      </div>

      {/* Bottom Nav Bar */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '1000px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', padding: '15px 10px 30px', borderTop: '1px solid #eee', borderRadius: '30px 30px 0 0', zIndex: 100 }}>
           <NavItem icon="settings" label="הגדרות" />
           <NavItem icon="analytics" label="אנליטיקות" />
           <NavItem icon="calendar_month" label="יומן" />
           <NavItem icon="group" label="הקבוצות שלי" active />
           <NavItem icon="home" label="בית" onClick={() => router.push('/dashboard')} />
      </nav>
    </div>
  );
}

// רכיבי עזר
function StatCard({ label, value, isTrend }: any) {
  return (
    <div style={{ backgroundColor: '#f1f4f8', borderRadius: '20px', padding: '20px', textAlign: 'center' }}>
      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{label}</p>
      <div style={{ fontSize: '20px', fontWeight: '900', color: '#003643', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        {value}
        {isTrend && <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#059669' }}>trending_up</span>}
      </div>
    </div>
  );
}

function RecordCard({ meeting, date, text }: any) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '25px', marginBottom: '15px', borderRight: '6px solid #1e4d5b', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#1e4d5b' }}>{meeting}</div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{date}</div>
      </div>
      <p style={{ fontSize: '15px', color: '#41484b', lineHeight: '1.6', textAlign: 'right' }}>{text}</p>
      <div style={{ textAlign: 'left', marginTop: '10px' }}>
        <span className="material-symbols-outlined" style={{ color: '#cbd5e1', cursor: 'pointer' }}>more_horiz</span>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: active ? '#003643' : '#999', cursor: 'pointer' }}>
      <span className="material-symbols-outlined">{icon}</span>
      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{label}</span>
    </div>
  );
}