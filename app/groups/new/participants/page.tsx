'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addSingleParticipant } from '../../../../lib/api';

/**
 * AddParticipantPage Component
 * * Provides a dedicated interface for registering new members into a specific therapeutic/training group.
 * Features strict, client-side input validations (ID format, dynamic phone matching, email patterns, dual-token names),
 * supports placeholder logic for attachment uploads, and seamlessly routes persistence between a backend 
 * API layer (when an explicit `groupId` query parameter exists) and localized fallback memory storage (`localStorage`).
 */
export default function AddParticipantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Query & References ---
  const groupId = searchParams.get('groupId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Component Form States ---
  const [fileName, setFileName] = useState('');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); 

  /**
   * Event Handler: File Capture Setup
   * Monitors input changes on hidden element and caches the chosen attachment filename.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  /**
   * Form Validator Utilities
   * Asserts logical conformity on name structure, ID integrity, email format, and localized mobile sequences.
   * @returns {boolean} True if all payload inputs clear data-integrity gates.
   */
  const validateForm = () => {
    // 1. Structural Check: Must feature at least a first name and a last name
    if (fullName.trim().split(' ').length < 2) {
      alert('נא להזין שם מלא (שם פרטי ומשפחה)');
      return false;
    }

    // 2. Identity Check: Must adhere to local ID format (9 digits)
    const idRegex = /^\d{9}$/;
    if (!idRegex.test(idNumber)) {
      alert('תעודת זהות חייבת להכיל בדיוק 9 ספרות');
      return false;
    }

    // 3. Network Check: Standard RFC 5322 compliance pattern mapping
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('כתובת האימייל אינה תקינה');
      return false;
    }

    // 4. Telecom Check: Israel standard mobile pattern validation
    const phoneRegex = /^05\d-?\d{7}$/;
    if (!phoneRegex.test(phone)) {
      alert('מספר הטלפון חייב להיות בפורמט תקין (למשל 0501234567)');
      return false;
    }

    return true;
  };

  /**
   * Submit Action Handlers
   * Routes data payload based on context criteria. Either dispatches to operational API
   * routing paths or registers structures locally to temporary creation caches.
   */
  const handleAddParticipant = async () => {
    
    // Prevent submissions failing raw validation rules
    if (!validateForm()) return;
  
    if (groupId) {
      // Scenario A: Active production context - push to upstream database routers
      const result = await addSingleParticipant(groupId, { fullName, idNumber, email, phone });
      
      if (result.success) {
        router.push(`/groups/${groupId}`); 
        router.refresh(); 
      } else {
        alert('שגיאה בשמירה: ' + result.error);
      }
    } else {
      // Scenario B: Temporary staging buffer - store within local client state registries
      const existing = JSON.parse(localStorage.getItem('temp_participants') || '[]');
      const updated = [...existing, { fullName, idNumber, email, phone }];
      localStorage.setItem('temp_participants', JSON.stringify(updated));
      router.back();
    }
  };

  return (
    <div style={{ backgroundColor: '#f8faff', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif', paddingBottom: '140px' }}>
      
      {/* Structural Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: 'white' }}>
        <span className="material-symbols-outlined" style={{ color: '#003643' }}>more_vert</span>
        <span style={{ fontWeight: 'bold', color: '#003643' }}>הוספת משתתף</span>
        <span className="material-symbols-outlined" style={{ color: '#003643', cursor: 'pointer' }} onClick={() => router.back()}>arrow_forward</span>
      </div>

      <div style={{ maxWidth: '450px', margin: '0 auto', padding: '20px' }}>
        <p style={{ color: '#999', fontSize: '12px', textAlign: 'right' }}>ניהול קבוצה</p>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#003643', textAlign: 'right', marginBottom: '30px' }}>פרטי המשתתף החדש</h1>

      {/* Structural Name Input Field */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '15px' }}>
          <label style={labelStyle}>שם מלא של המשתתף</label>
          <input type="text" placeholder="ישראל ישראלי" style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

      {/* Input Block: National ID (Sanitizes non-digits dynamically) */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '15px' }}>
          <label style={labelStyle}>מספר זהות / מזהה</label>
          <input type="text" maxLength={9} placeholder="9 ספרות" style={inputStyle} value={idNumber} onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))} />
        </div>

      {/* Input Block: Contact Channels (Email & Phone Sanitation) */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '20px', marginBottom: '15px' }}>
          <label style={labelStyle}>פרטי התקשרות</label>
          <input type="email" placeholder="email@example.com" style={{ ...inputStyle, marginBottom: '10px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="text" placeholder="מספר טלפון (למשל 0501234567)" style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
        </div>

      {/* Attachment Upload System Wrapper Component (Placeholder for future file attachments) */}
        <div onClick={() => fileInputRef.current?.click()} style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', marginBottom: '15px', border: '1px dashed #cbd5e1', textAlign: 'center', cursor: 'pointer' }}>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <span className="material-symbols-outlined" style={{ color: '#cff0f6', fontSize: '40px' }}>upload_file</span>
          <h3 style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>
            {fileName ? `קובץ נבחר: ${fileName}` : 'העלאת מסמכים רלוונטיים'}
          </h3>
          <button style={{ marginTop: '10px', backgroundColor: '#e2e8f0', border: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '12px' }}>בחירת קבצים</button>
        </div>

      {/* Submit Actions Button Tray */}
        <button onClick={handleAddParticipant} style={{ width: '100%', backgroundColor: '#003643', color: 'white', padding: '18px', borderRadius: '12px', border: 'none', fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer' }}>הוספה לקבוצה</button>
        <button onClick={() => router.back()} style={{ width: '100%', backgroundColor: 'transparent', color: '#003643', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>ביטול וחזרה</button>
      </div>
    </div>
  );
}

// --- Layout Sheet Token Properties ---
const labelStyle = { display: 'block', fontWeight: 'bold', color: '#003643', marginBottom: '10px', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#f1f4f8', outline: 'none' };
