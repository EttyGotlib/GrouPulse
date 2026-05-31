'use client';

import React from 'react';
import InstituteNav from '../../components/ui/InstituteNav';

export default function InstituteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ backgroundColor: '#f7f9fe', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f7f9fe', minHeight: '100vh', position: 'relative' }}>
        
        {/* ה-Header העליון קבוע למעלה */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '18px 24px', // הוגדל מעט המרווח סביב הלוגו
          backgroundColor: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(10px)', 
          position: 'sticky', 
          top: 0, 
          zIndex: 100,
          borderBottom: '1px solid #f1f4f8' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
             {/* עיגול הלוגו - הוגדל מ-40px ל-48px כדי לתת נוכחות ברורה */}
             <div style={{ 
               width: '48px', 
               height: '48px', 
               borderRadius: '50%', 
               backgroundColor: '#003643', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               color: 'white', 
               fontWeight: '900', // הדגשה חזקה יותר לאות
               fontSize: '22px' // הגדלת האות G בפנים לקבלת מראה מלא
             }}>
               G
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
               {/* שם האפליקציה - הוגדל ל-22px עם ריווח אותיות נכון */}
               <span style={{ fontWeight: '800', color: '#003643', fontSize: '22px', lineHeight: '1.1' }}>GrouPulse</span>
               <span style={{ color: '#a1aab0', fontSize: '13px', fontWeight: '800', marginTop: '3px' }}>מוסדות</span>
             </div>
          </div>
        </header>

        {/* תוכן עמודי המוסד */}
        <main style={{ padding: '40px 20px 140px 20px' }}>
          {children}
        </main>

        {/* סרגל הניווט הנקי - קבוע למטה במרכז */}
        <InstituteNav />
        
      </div>
    </div>
  );
}