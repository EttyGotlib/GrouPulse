'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNewGroup } from '../../../lib/api';

export default function NewGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State לניהול פרטי הקבוצה
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('קבוצת תמיכה');
  const [sessionCount, setSessionCount] = useState(12); // כאן נשמר מספר המפגשים
  const [startDate, setStartDate] = useState(''); 
  const [meetingDay, setMeetingDay] = useState('ראשון'); 
  const [locationNotes, setLocationNotes] = useState(''); 
  const [participants, setParticipants] = useState<any[]>([]);

  // 1. טעינת נתונים מהזיכרון המקומי
  useEffect(() => {
    const savedName = localStorage.getItem('temp_group_name');
    const savedType = localStorage.getItem('temp_group_type');
    const savedDate = localStorage.getItem('temp_start_date');
    const savedDay = localStorage.getItem('temp_meeting_day');
    const savedCount = localStorage.getItem('temp_session_count');
    const savedParticipants = localStorage.getItem('temp_participants');
    
    if (savedName) setGroupName(savedName);
    if (savedType) setGroupType(savedType);
    if (savedDate) setStartDate(savedDate);
    if (savedDay) setMeetingDay(savedDay);
    if (savedCount) setSessionCount(parseInt(savedCount));
    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName) return alert('אנא הכניסי שם לקבוצה');
    setLoading(true);

    try {
      const result = await createNewGroup(
        { 
          name: groupName, 
          type: groupType,
          startDate: startDate,
          meetingDay: meetingDay,
          locationNotes: locationNotes,
          sessionCount: sessionCount
        },
        participants
      );

      if (result.success) {
        // --- תיקון הניקוי: מוחקים רק את הנתונים הזמניים ולא את כל המשתמש ---
        localStorage.removeItem('temp_group_name');
        localStorage.removeItem('temp_group_type');
        localStorage.removeItem('temp_start_date');
        localStorage.removeItem('temp_meeting_day');
        localStorage.removeItem('temp_participants');
        localStorage.removeItem('temp_session_count');
        localStorage.removeItem('locationNotes'); // אם שמרת גם אותו

        alert('הקבוצה נוצרה בהצלחה!');
        
        // מעבר לדאשבורד
        router.push('/dashboard'); 
      } else {
        alert('שגיאה ביצירת הקבוצה: ' + result.error);
      }
    } catch (error) {
      console.error(error);
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
          <p style={{ color: '#41484b', fontSize: '15px' }}>הגדירי את פרטי הקבוצה החדשה.</p>
        </div>

        {/* שם קבוצה */}
        <div style={cardStyle}>
          <label style={labelStyle}>שם הקבוצה</label>
          <input type="text" style={inputStyle} value={groupName} onChange={(e) => setGroupName(e.target.value)} />
        </div>

        {/* תאריך ויום   */}
        <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ ...cardStyle, flex: 1 }}>
                <label style={labelStyle}>תאריך התחלה</label>
                <input type="date" style={inputStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div style={{ ...cardStyle, flex: 1 }}>
                <label style={labelStyle}>יום מפגש</label>
                <select style={inputStyle} value={meetingDay} onChange={(e) => setMeetingDay(e.target.value)}>
                    <option>ראשון</option>
                    <option>שני</option>
                    <option>שלישי</option>
                    <option>רביעי</option>
                    <option>חמישי</option>
                    <option>שישי</option>
                </select>
            </div>
        </div>

        {/* מיקום */}
        <div style={cardStyle}>
          <label style={labelStyle}>מיקום / הערות ללו"ז</label>
          <input type="text" placeholder="לדוגמה: חדר 302, בניין א'" style={inputStyle} value={locationNotes} onChange={(e) => setLocationNotes(e.target.value)} />
        </div>

        {/*מונה מפגשים-     */}
        <div style={cardStyle}>
          <label style={labelStyle}>מספר מפגשים מתוכנן</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e9eef5', borderRadius: '12px', padding: '8px' }}>
            <button onClick={() => setSessionCount(sessionCount + 1)} style={stepperBtn}>+</button>
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#003643' }}>{sessionCount}</span>
            <button onClick={() => setSessionCount(Math.max(1, sessionCount - 1))} style={stepperBtn}>-</button>
          </div>
        </div>

        {/* תצוגת משתתפים */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {participants.map((p, index) => (
            <div key={index} style={{ backgroundColor: '#cff0f6', color: '#003643', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              {p.fullName}
            </div>
          ))}
        </div>

        <button onClick={handleCreateGroup} disabled={loading} style={submitBtnStyle}>
          {loading ? 'יוצר קבוצה...' : 'צור קבוצה חדשה'}
        </button>

      </div>
    </div>
  );
}

// עיצובים
const cardStyle = { backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' };
const labelStyle = { display: 'block', fontWeight: 'bold', color: '#003643', marginBottom: '10px', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#e9eef5', outline: 'none' };
const submitBtnStyle = { width: '100%', backgroundColor: '#003643', color: 'white', padding: '20px', borderRadius: '16px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' };
const stepperBtn = { background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003643' };