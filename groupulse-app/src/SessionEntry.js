import React, { useState } from 'react';
import './App.css';

const INITIAL_PARTICIPANTS = [
  { id: 1, name: 'אלון ר.', initial: 'אר' },
  { id: 2, name: 'מיכל כ.', initial: 'מכ' },
  { id: 3, name: 'יואב ל.', initial: 'יל' },
  { id: 4, name: 'דנה פ.', initial: 'דפ' },
];

function SessionEntry({ onOpenHistory, onAnalysisComplete }) {
  // --- States ---
  const [groupNotes, setGroupNotes] = useState('');
  const [attendance, setAttendance] = useState({ 1: true, 2: false, 3: true, 4: true });
  const [metrics, setMetrics] = useState({ cohesion: 'בינונית', engagement: 'מאוזנת', atmosphere: 'ניטרלית' });
  const [expandedId, setExpandedId] = useState(null); 

  const [participantScores, setParticipantScores] = useState({ 1: 3, 2: 3, 3: 3, 4: 3 });
  const [participantNotes, setParticipantNotes] = useState({ 1: '', 2: '', 3: '', 4: '' });

  // --- Functions ---
  const toggleAttendance = (id) => {
    setAttendance(prev => {
      const isNowAbsent = prev[id]; 
      if (isNowAbsent && expandedId === id) {
        setExpandedId(null); 
      }
      return { ...prev, [id]: !prev[id] };
    });
  };

  const handleParticipantNoteChange = (id, text) => {
    setParticipantNotes(prev => ({ ...prev, [id]: text }));
  };

  // הפונקציה המעודכנת לחיבור ל-AI
  const handleSave = async () => {
    const activeData = INITIAL_PARTICIPANTS
      .filter(p => attendance[p.id])
      .map(p => ({
        name: p.name,
        score: participantScores[p.id],
        note: participantNotes[p.id]
      }));

    const finalPayload = {
      groupNotes,
      metrics,
      participants: activeData
    };

    console.log("Sending to AI analysis...", finalPayload);

    try {
      // קריאה לשרת ה-Backend
      const response = await fetch('http://localhost:3000/session/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) throw new Error('Server error');

      const aiResult = await response.json();

      // מעבר לדף הסיכום עם התשובה מה-AI
      if (onAnalysisComplete) {
        onAnalysisComplete(aiResult);
      }

    } catch (error) {
      console.error("Error connecting to Backend:", error);
      alert("לא ניתן להתחבר לשרת. וודאי שה-Backend פועל (node server.js).");
    }
  };

  return (
    <div className="session-page">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <span onClick={onOpenHistory} style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🗓️</span>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#003344', fontSize: '1.1rem' }}>יומן מפגש: דינמיקה קבוצתית</div>
          <div style={{ fontSize: '0.85rem', color: '#888' }}>24.05.24 | חרדה חברתית</div>
        </div>
        <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>➡️</span>
      </header>

      {/* 1. תיעוד קבוצתי */}
      <div className="card">
        <div className="section-title">
          תיעוד קבוצתי 
          <span style={{ fontSize: '0.7rem', background: '#cceeff', color: '#006688', padding: '3px 10px', borderRadius: '12px', marginRight: '10px' }}>מפגש מס' 12</span>
        </div>
        <textarea 
          placeholder="תאר את מהלך המפגש..."
          className="group-textarea"
          style={{ width: '100%', border: 'none', background: '#f5f7f9', borderRadius: '12px', padding: '15px', minHeight: '120px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
          value={groupNotes}
          onChange={(e) => setGroupNotes(e.target.value)}
        />
      </div>

      {/* 2. מדדי קבוצה */}
      <div className="card">
        <MetricSelector label="מדד לכידות קבוצתית" options={['נמוכה', 'בינונית', 'גבוהה']} current={metrics.cohesion} setter={(v) => setMetrics({...metrics, cohesion: v})} />
        <MetricSelector label="רמת מעורבות כללית" options={['פסיבית', 'מאוזנת', 'אינטנסיבית']} current={metrics.engagement} setter={(v) => setMetrics({...metrics, engagement: v})} />
        <MetricSelector label="אווירה כללית" options={['מתוחה', 'ניטרלית', 'תומכת']} current={metrics.atmosphere} setter={(v) => setMetrics({...metrics, atmosphere: v})} />
      </div>

      {/* 3. צ'ק-ליסט נוכחות */}
      <div className="card">
        <div className="section-title">צ'ק-ליסט נוכחות</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {INITIAL_PARTICIPANTS.map(p => (
            <div key={p.id} onClick={() => toggleAttendance(p.id)} style={{ background: attendance[p.id] ? '#fff' : '#f1f3f5', border: attendance[p.id] ? '2px solid #003344' : '2px solid transparent', padding: '14px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <span style={{ fontWeight: '600', color: attendance[p.id] ? '#003344' : '#888' }}>{p.name}</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #003344', display: 'flex', alignItems: 'center', justifyContent: 'center', background: attendance[p.id] ? '#003344' : 'transparent', color: 'white', fontSize: '0.7rem' }}>
                {attendance[p.id] && '✓'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. תיעוד פרטני */}
      <div className="section-title" style={{ marginRight: '10px', marginTop: '25px' }}>תיעוד פרטני</div>
      {INITIAL_PARTICIPANTS.map(p => {
        const isPresent = attendance[p.id];
        return (
          <div key={p.id} className="card" style={{ padding: '12px 20px', opacity: isPresent ? 1 : 0.5, backgroundColor: isPresent ? '#fff' : '#f9f9f9', border: expandedId === p.id ? '1px solid #003344' : '1px solid transparent', transition: '0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: isPresent ? 'pointer' : 'not-allowed' }} onClick={() => isPresent && setExpandedId(expandedId === p.id ? null : p.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="participant-badge" style={{ background: isPresent ? '#81d8d0' : '#ddd', color: isPresent ? '#003344' : '#888' }}>{p.initial}</div>
                <div>
                    <div style={{ fontWeight: 'bold', color: isPresent ? '#003344' : '#888' }}>{p.name}</div>
                    {!isPresent && <div style={{ fontSize: '0.7rem', color: '#aaa' }}>לא נכח במפגש</div>}
                </div>
              </div>
              {isPresent && <span style={{ fontSize: '0.8rem' }}>{expandedId === p.id ? '🔼' : '🔽'}</span>}
            </div>
            {isPresent && expandedId === p.id && (
              <div style={{ marginTop: '18px', borderTop: '1px solid #f0f0f0', paddingTop: '18px' }}>
                <MetricSelector label="רמת השתתפות" options={[1, 2, 3, 4, 5]} current={participantScores[p.id]} setter={(val) => setParticipantScores({...participantScores, [p.id]: val})} />
                <textarea 
                  placeholder={`תיעוד על ${p.name}...`}
                  style={{ width: '100%', border: 'none', background: '#f5f7f9', borderRadius: '10px', padding: '12px', marginTop: '10px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  rows={4} value={participantNotes[p.id]} onChange={(e) => handleParticipantNoteChange(p.id, e.target.value)}
                />
              </div>
            )}
          </div>
        );
      })}

      <button className="submit-fixed-btn" onClick={handleSave} style={{ marginBottom: '40px' }}>
        <span>💾</span> שמור תיעוד
      </button>
    </div>
  );
}

function MetricSelector({ label, options, current, setter }) {
  return (
    <div className="segmented-container">
      <label className="segmented-label">{label}</label>
      <div className="segmented-controls">
        {options.map(opt => (
          <button key={opt} type="button" className={`seg-btn ${current === opt ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setter(opt); }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SessionEntry;