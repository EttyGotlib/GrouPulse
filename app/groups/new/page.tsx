'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { createNewGroup } from '../../../lib/api';

export default function NewGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  

  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('קבוצת תמיכה');
  const [meeting_time, setMeetingTime] = useState(''); 
  const [session_count, setSessionCount] = useState(12);
  const [participants, setParticipants] = useState<any[]>([]);
  const [start_date, setStartDate] = useState('');
  const [meeting_day, setMeetingDay] = useState('');
  const [location_notes, setLocationNotes] = useState('');

  
  useEffect(() => {
    const savedName = localStorage.getItem('temp_group_name');
    const savedType = localStorage.getItem('temp_group_type');
    const savedCount = localStorage.getItem('temp_session_count');
    const savedParticipants = localStorage.getItem('temp_participants');
    const savedTime = localStorage.getItem('temp_meeting_time');
    const savedStartDate = localStorage.getItem('temp_start_date');
    const savedMeetingDay = localStorage.getItem('temp_meeting_day');
    const savedLocationNotes = localStorage.getItem('temp_location_notes');

    setGroupName(savedName || '');
    setGroupType(savedType || 'קבוצת תמיכה');
    setSessionCount(savedCount ? parseInt(savedCount) : 12);
    setParticipants(savedParticipants ? JSON.parse(savedParticipants) : []);
    setMeetingTime(savedTime || '');
    setStartDate(savedStartDate || '');
    setMeetingDay(savedMeetingDay || '');
    setLocationNotes(savedLocationNotes || '');
  }, []);


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

  
  const handleTimeChange = (val: string) => {
    setMeetingTime(val);
    localStorage.setItem('temp_meeting_time', val);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    localStorage.setItem('temp_start_date', val);
  };

  const handleMeetingDayChange = (val: string) => {
    setMeetingDay(val);
    localStorage.setItem('temp_meeting_day', val);
  };

  const handleLocationNotesChange = (val: string) => {
    setLocationNotes(val);
    localStorage.setItem('temp_location_notes', val);
  };

  const handleCreateGroup = async () => {
    if (!groupName) return alert('אנא הכניסי שם לקבוצה');
    setLoading(true);
  
    try {
      const result = await createNewGroup(
        {
          name: groupName, 
          type: groupType,
          meeting_time: meeting_time, 
          session_count: session_count,
          meeting_day: meeting_day,
          location_notes: location_notes,
          start_date: start_date 
        },
        participants
      );
  
      if (result.success) {
  
        localStorage.removeItem('temp_participants');
        localStorage.removeItem('temp_group_name');
        localStorage.removeItem('temp_group_type');
        localStorage.removeItem('temp_session_count');
        localStorage.removeItem('temp_meeting_time');
        localStorage.removeItem('temp_start_date');
        localStorage.removeItem('temp_meeting_day');
        localStorage.removeItem('temp_location_notes');
  
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

        {}
        <div style={cardStyle}>
          <label style={labelStyle}>שם הקבוצה</label>
          <input type="text" placeholder="לדוגמה: התמודדות עם חרדה" style={inputStyle} value={groupName} onChange={(e) => handleNameChange(e.target.value)} />
        </div>

        {}
        <div style={cardStyle}>
          <label style={labelStyle}>סוג הקבוצה</label>
          <select value={groupType} onChange={(e) => handleTypeChange(e.target.value)} style={inputStyle}>
            <option>קבוצת תמיכה</option>
            <option>טיפול קבוצתי</option>
            <option>סדנה רגשית</option>
          </select>
        </div>

        {}
        <div style={cardStyle}>
          <label style={labelStyle}>באיזה שעה מתקיים המפגש?</label>
          <input 
            type="time" 
            style={inputStyle} 
            value={meeting_time} 
            onChange={(e) => handleTimeChange(e.target.value)} 
          />
        </div>

        {}
        <div style={cardStyle}>
          <label style={labelStyle}>מספר מפגשים מתוכנן</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e9eef5', borderRadius: '12px', padding: '8px' }}>
            <button onClick={() => handleCountChange(session_count + 1)} style={stepperBtn}>+</button>
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#003643' }}>{session_count}</span>
            <button onClick={() => handleCountChange(Math.max(1, session_count - 1))} style={stepperBtn}>-</button>
          </div>
        </div>

        {}
        <div style={cardStyle}>
          <label style={labelStyle}>מתי תאריך ההתחלה?</label>
          <input type="date" style={inputStyle} value={start_date} onChange={(e) => handleStartDateChange(e.target.value)} />
        </div>

        {}
        <div style={cardStyle}>
          <label style={labelStyle}>מה יום המפגש הקבוע?</label>
          <select 
            style={inputStyle}
            value={meeting_day}
            onChange={(e) => handleMeetingDayChange(e.target.value)}
          >
            <option value="">בחרי יום...</option>
            <option>יום ראשון</option>
            <option>יום שני</option>
            <option>יום שלישי</option>
            <option>יום רביעי</option>
            <option>יום חמישי</option>
            <option>יום שישי</option>
          </select>
        </div>

        {}
        <div style={cardStyle}>
          <label style={labelStyle}>הערות ללו"ז ומיקום</label>
          <textarea 
            placeholder="למשל: המפגשים יתקיימו בזום / בקליניקה" 
            style={{...inputStyle, height: '80px', resize: 'none', paddingTop: '15px'}} 
            value={location_notes} 
            onChange={(e) => handleLocationNotesChange(e.target.value)}
          />
        </div>

        {}
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


const cardStyle = { backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' };
const labelStyle = { display: 'block', fontWeight: 'bold', color: '#003643', marginBottom: '10px', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#e9eef5', outline: 'none' };
const stepperBtn = { background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px' };