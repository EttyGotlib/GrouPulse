import React from 'react';

function SessionSummary({ data, onBack }) {
  return (
    <div className="session-page" style={{ direction: 'rtl' }}>
      <header className="page-header">
        <button className="pdf-btn">📄 הורד סיכום (PDF)</button>
        <div style={{ fontWeight: 'bold' }}>סיכום מפגש</div>
        <span onClick={onBack} style={{ cursor: 'pointer', fontSize: '1.2rem' }}>➡️</span>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <span className="ai-badge">ניתוח מערכת AI</span>
        <h2 style={{ margin: '5px 0', color: '#003344' }}>סיכום מפגש מבוסס AI</h2>
        <p style={{ color: '#888', fontSize: '0.85rem' }}>מפגש קבוצתי: תמיכה רגשית - 12 באוקטובר, 2023</p>
      </div>

      <div className="card">
        <h3 className="section-title">💡 תובנות מפתח</h3>
        <ul style={{ paddingRight: '20px', lineHeight: '1.6' }}>
          {data.insights.map((insight, i) => <li key={i} style={{ marginBottom: '8px' }}>{insight}</li>)}
        </ul>
      </div>

      <div className="card">
        <h3 className="section-title">👥 דינמיקה קבוצתית</h3>
        <div style={{ fontSize: '0.85rem', marginBottom: '5px' }}>לכידות קבוצתית: {data.cohesionScore}%</div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${data.cohesionScore}%` }}></div>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#444' }}>{data.groupDynamicsSummary}</p>
      </div>

      <div className="ai-bubble-card">
        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>ניתוח רגשי</div>
        <div style={{ marginTop: '10px' }}>
          הטון השולט במפגש היה <strong>"{data.dominantEmotion}"</strong> ו"השלמה".
        </div>
      </div>

      <h3 className="section-title" style={{ marginRight: '10px' }}>👤 דגשים פרטניים</h3>
      {data.individualInsights.map((p, i) => (
        <div key={i} className="individual-insight-card">
          <div>
            <div style={{ fontWeight: 'bold', color: '#003344' }}>{p.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.insight}</div>
          </div>
          <div style={{ background: '#f0f2f5', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
        </div>
      ))}
      
      <button className="edit-btn">✎ ערוך תובנות ידנית</button>
    </div>
  );
}

export default SessionSummary;