import React, { useEffect, useState } from 'react';

function SessionHistory({ onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // משיכת ההיסטוריה מהשרת ברגע שהדף עולה
  useEffect(() => {
    fetch('http://localhost:3000/session/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="session-page">
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: 25 }}>
        <span onClick={onBack} style={{ fontSize: '1.2rem', cursor: 'pointer', marginLeft: '15px' }}>⬅️</span>
        <div style={{ fontWeight: 'bold', color: '#003344', fontSize: '1.1rem' }}>היסטוריית מפגשים</div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>טוען היסטוריה...</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>עוד לא נשמרו מפגשים</div>
      ) : (
        history.map((item) => (
          <div key={item.id} className="card" style={{ padding: '15px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#003344' }}>{item.date}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  רגש דומיננטי: {item.analysis.dominantEmotion}
                </div>
              </div>
              <div style={{ 
                background: '#e6f3f0', 
                color: '#006688', 
                padding: '5px 12px', 
                borderRadius: '10px', 
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                לכידות: {item.analysis.cohesionScore}%
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#444', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <strong>סיכום דינמיקה:</strong> {item.analysis.groupDynamicsSummary}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SessionHistory;