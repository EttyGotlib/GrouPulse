import React from 'react';

function Dashboard({ onStartSession }) {
  const stats = [
    { label: 'קבוצות פעילות', value: 4, icon: '⚽' },
    { label: "סה''כ משתתפים", value: 32, icon: '👥' },
    { label: 'מפגשים השבוע', value: 12, icon: '📅' },
    { label: 'תיעודים חסרים', value: 2, icon: '📝', alert: true },
  ];

  const groups = [
    { id: 1, name: 'קבוצת תמיכה - חרדה', type: 'קבוצת תמיכה', members: 8, sessions: 12, next: 'מחר, 18:00', color: '#e6f7f5' },
    { id: 2, name: 'דינמיקה קבוצתית', type: 'דינמיקה', members: 12, sessions: 6, next: "יום ג', 16:30", color: '#f0f4f8' },
  ];

  return (
    <div className="session-page" style={{ paddingBottom: '120px' }}>
      <header style={{ padding: '20px 0', textAlign: 'right' }}>
        <h1 style={{ color: 'var(--grou-dark)', marginBottom: '5px' }}>ברוך הבא, ד"ר לוי</h1>
        <p style={{ color: 'var(--grou-text-secondary)', fontSize: '0.9rem' }}>המערכת מעודכנת עם נתוני הקבוצות.</p>
      </header>

      {/* כרטיסי מדדים */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '15px', pointerEvents: 'none' }}>
            <div style={{ fontSize: '1.4rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</div>
            <div style={{ fontSize: '0.7rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h3 className="section-title">הקבוצות שלי</h3>

      <div>
        {groups.map((group) => (
          <div key={group.id} className="card" style={{ padding: '20px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
               <span className="ai-badge">{group.type}</span>
               <span>⚙️</span>
            </div>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--grou-dark)' }}>{group.name}</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                {group.members} משתתפים | {group.sessions} מפגשים
              </div>

              {/* הכפתור הקריטי - שימי לב ל-onClick */}
              <button 
                className="pdf-btn" /* משתמש בעיצוב הקיים ב-App.css */
                onClick={() => {
                  console.log("מעבר לדף תיעוד...");
                  onStartSession();
                }}
                style={{ 
                  cursor: 'pointer', 
                  padding: '10px 20px', 
                  backgroundColor: 'var(--grou-dark)',
                  zIndex: 100 /* מוודא שהוא מעל הכל */
                }}
              >
                תיעוד מפגש ◀
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;