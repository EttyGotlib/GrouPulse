'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function AddParticipantPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  // State לשמירת פרטי המשתתף
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleAddParticipant = () => {
    if (!fullName) return alert('אנא הזיני שם מלא');
    
    // קריאת המשתתפים הקיימים
    const existing = JSON.parse(localStorage.getItem('temp_participants') || '[]');
    
    // הוספת החדש
    const updated = [...existing, { fullName, idNumber, email }];
    
    // שמירה חזרה לזיכרון
    localStorage.setItem('temp_participants', JSON.stringify(updated));
    
    router.back(); // חזרה לדף יצירת הקבוצה
  };

  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: 'white' }}>
        <span className="material-symbols-outlined" style={{ color: '#003643' }}>more_vert</span>
        <span style={{ fontWeight: 'bold', color: '#003643' }}>הוספת משתתף</span>
        <span className="material-symbols-outlined" style={{ color: '#003643', cursor: 'pointer' }} onClick={() => router.back()}>arrow_forward</span>
      </div>

      <div style={{ maxWidth: '450px', margin: '0 auto', padding: '20px' }}>
        <p style={{ color: '#999', fontSize: '12px', textAlign: 'right' }}>ניהול קבוצה</p>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#003643', textAlign: 'right', marginBottom: '30px' }}>פרטי המשתתף החדש</h1>

        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '15px' }}>
          <label style={labelStyle}>שם מלא של המשתתף</label>
          <input type="text" placeholder="ישראל ישראלי" style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '15px' }}>
          <label style={labelStyle}>מספר זהות / מזהה</label>
          <input type="text" placeholder="9 ספרות" style={inputStyle} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '15px' }}>
          <label style={labelStyle}>פרטי התקשרות</label>
          <input type="email" placeholder="email@example.com" style={{ ...inputStyle, marginBottom: '10px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="text" placeholder="05X-XXXXXXX" style={inputStyle} />
        </div>

        <div onClick={() => fileInputRef.current?.click()} style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', marginBottom: '15px', border: '1px dashed #cbd5e1', textAlign: 'center', cursor: 'pointer' }}>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <span className="material-symbols-outlined" style={{ color: '#cff0f6', fontSize: '40px' }}>upload_file</span>
          <h3 style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>
            {fileName ? `קובץ נבחר: ${fileName}` : 'העלאת מסמכים רלוונטיים'}
          </h3>
          <button style={{ marginTop: '10px', backgroundColor: '#e2e8f0', border: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '12px' }}>בחירת קבצים</button>
        </div>

        <div style={{ backgroundColor: '#1e4d5b', color: 'white', padding: '15px', borderRadius: '15px', display: 'flex', gap: '10px', fontSize: '12px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined">info</span>
          <p>הוספת משתתף תשלח באופן אוטומטי הזמנה ראשונית למערכת GrouPulse.</p>
        </div>

        <button onClick={handleAddParticipant} style={{ width: '100%', backgroundColor: '#003643', color: 'white', padding: '18px', borderRadius: '12px', border: 'none', fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer' }}>הוספה לקבוצה</button>
        <button onClick={() => router.back()} style={{ width: '100%', backgroundColor: 'transparent', color: '#003643', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>ביטול וחזרה</button>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', color: '#003643', marginBottom: '10px', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#f1f4f8', outline: 'none' };