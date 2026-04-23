'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { createNewGroup } from '../../../lib/api';

export default function NewGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State לניהול הטופס
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('קבוצת תמיכה');
  const [sessionCount, setSessionCount] = useState(12);
  const [participants, setParticipants] = useState<any[]>([]);

  // 1. טעינת נתונים מהזיכרון ברגע שהדף עולה
  useEffect(() => {
    const savedName = localStorage.getItem('temp_group_name');
    const savedType = localStorage.getItem('temp_group_type');
    const savedCount = localStorage.getItem('temp_session_count');
    const savedParticipants = localStorage.getItem('temp_participants');

    if (savedName) setGroupName(savedName);
    if (savedType) setGroupType(savedType);
    if (savedCount) setSessionCount(parseInt(savedCount));
    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
  }, []);

  // 2. פונקציות עזר לשמירה מיידית בזיכרון בזמן שינוי
  const handleNameChange = (val: string) => {
    setGroupName(val);
    localStorage.setItem('temp_group_name', val);
  };

  const handleTypeChange = (val: string) => {
    setGroupType(val);
    localStorage.setItem('temp_group_type', val);
  };

  const handleCountChange = (newCount: number) => {
    setSessionCount(newCount);
    localStorage.setItem('temp_session_count', newCount.toString());
  };

  const handleCreateGroup = async () => {
    if (!groupName) return alert('אנא הכניסי שם לקבוצה');
    setLoading(true);
  
    try {
      const result = await createNewGroup(
        { name: groupName, type: groupType },
        participants
      );
  
      if (result.success) {
        // אם השמירה הצליחה - מנקים את הזיכרון המקומי
        localStorage.removeItem('temp_participants');
        localStorage.removeItem('temp_group_name');
        localStorage.removeItem('temp_group_type');
        localStorage.removeItem('temp_session_count');
  
        alert('הקבוצה נוצרה בהצלחה!');
        router.push('/dashboard');
      } else {
        alert('שגיאה ביצירת הקבוצה: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה לא צפויה במערכת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif', paddingBottom: '140px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <span className="material-symbols-outlined" style={{ color: '#003643' }}>more_vert</span>
        <span style={{ fontWeight: 'bold', color: '#003643' }}>קבוצה חדשה</span>
        <span className="material-symbols-outlined" style={{ color: '#003643', cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>arrow_forward</span>
      </div>

      <div style={{ maxWidth: '450px', margin: '0 auto', padding: '20px' }}>
        
        <div style={{ textAlign: 'right', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#003643', marginBottom: '10px' }}>יצירת מרחב טיפולי</h1>
          <p style={{ color: '#41484b', fontSize: '15px' }}>הגדר את פרטי הקבוצה החדשה כדי להתחיל.</p>
        </div>

        {/* שם קבוצה */}
        <div style={cardStyle}>
          <label style={labelStyle}>שם הקבוצה</label>
          <input type="text" placeholder="לדוגמה: התמודדות עם חרדה" style={inputStyle} value={groupName} onChange={(e) => handleNameChange(e.target.value)} />
        </div>

        {/* סוג קבוצה */}
        <div style={cardStyle}>
          <label style={labelStyle}>סוג הקבוצה</label>
          <select value={groupType} onChange={(e) => handleTypeChange(e.target.value)} style={inputStyle}>
            <option>קבוצת תמיכה</option>
            <option>טיפול קבוצתי</option>
            <option>סדנה רגשית</option>
          </select>
        </div>

        {/* מונה מפגשים */}
        <div style={cardStyle}>
          <label style={labelStyle}>מספר מפגשים מתוכנן</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e9eef5', borderRadius: '12px', padding: '8px' }}>
            <button onClick={() => handleCountChange(sessionCount + 1)} style={stepperBtn}>+</button>
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#003643' }}>{sessionCount}</span>
            <button onClick={() => handleCountChange(Math.max(1, sessionCount - 1))} style={stepperBtn}>-</button>
          </div>
        </div>

        {/* תצוגת משתתפים שנוספו */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {participants.map((p, index) => (
            <div key={index} style={{ backgroundColor: '#cff0f6', color: '#003643', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              {p.fullName}
            </div>
          ))}
        </div>

        <div onClick={() => router.push('/groups/new/participants')} style={{ ...cardStyle, border: '2px dashed #cbd5e1', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ backgroundColor: '#cff0f6', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <span className="material-symbols-outlined" style={{ color: '#003643' }}>person_add</span>
          </div>
          <h3 style={{ fontWeight: 'bold', color: '#003643', margin: 0 }}>הוספת משתתפים</h3>
        </div>

        <button onClick={handleCreateGroup} disabled={loading} style={{ width: '100%', backgroundColor: '#003643', color: 'white', padding: '20px', borderRadius: '16px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', opacity: loading ? 0.7 : 1, position: 'relative', zIndex: 10 }}>
          {loading ? 'יוצר קבוצה...' : 'צור קבוצה חדשה'}
        </button>

      </div>
    </div>
  );
}

// רכיבי עזר לעיצוב
const cardStyle = { backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' };
const labelStyle = { display: 'block', fontWeight: 'bold', color: '#003643', marginBottom: '10px', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#e9eef5', outline: 'none' };
const stepperBtn = { background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px' };