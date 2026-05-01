import React, { useState } from 'react';
import './App.css';
import Dashboard from './Dashboard';
import SessionEntry from './SessionEntry';
import SessionSummary from './SessionSummary';
import SessionHistory from './SessionHistory';

function App() {
  // דף הבית הוא ה-Dashboard
  const [currentPage, setCurrentPage] = useState('home'); 
  const [analysisResult, setAnalysisResult] = useState(null);

  // פונקציה למעבר לסיכום לאחר ניתוח ה-AI
  const handleAnalysisComplete = (data) => {
    setAnalysisResult(data);
    setCurrentPage('summary');
  };

  return (
    <div className="App">
      {/* סרגל עליון קבוע */}
      <nav style={{ 
        backgroundColor: '#001529', 
        padding: '15px', 
        color: 'white', 
        textAlign: 'center', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100 
      }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>GrouPulse - AI Insights</h1>
      </nav>

      <main style={{ paddingBottom: '100px' }}>
        {/* לוח בקרה - Dashboard */}
        {currentPage === 'home' && (
          <Dashboard onStartSession={() => setCurrentPage('entry')} />
        )}

        {/* דף תיעוד מפגש חדש */}
        {currentPage === 'entry' && (
          <SessionEntry 
            onOpenHistory={() => setCurrentPage('history')} 
            onAnalysisComplete={handleAnalysisComplete} 
          />
        )}

        {/* דף סיכום הניתוח */}
        {currentPage === 'summary' && analysisResult && (
          <SessionSummary data={analysisResult} onBack={() => setCurrentPage('home')} />
        )}

        {/* דף היסטוריית מפגשים */}
        {currentPage === 'history' && (
          <SessionHistory onBack={() => setCurrentPage('home')} />
        )}
      </main>

      {/* תפריט ניווט תחתון (Bottom Navigation) */}
      <footer className="bottom-nav">
        <button className="nav-item" onClick={() => alert('הגדרות בקרוב...')}>
          <span>⚙️</span><br/>הגדרות
        </button>
        
        <button className="nav-item" onClick={() => alert('אנליטיקה בקרוב...')}>
          <span>📈</span><br/>אנליטיקה
        </button>
        
        {/* כפתור "הקבוצות שלי" - מחזיר תמיד ל-Dashboard */}
        <button 
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`} 
          onClick={() => setCurrentPage('home')}
        >
          <div className="nav-icon-bg">👥</div>
          <span>הקבוצות שלי</span>
        </button>

        {/* כפתור "יומן מפגשים" - מוביל להיסטוריה */}
        <button 
          className={`nav-item ${currentPage === 'history' ? 'active' : ''}`} 
          onClick={() => setCurrentPage('history')}
        >
          <span>📖</span><br/>יומן
        </button>
        
        {/* כפתור "בית" - מחזיר ל-Dashboard */}
        <button 
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`} 
          onClick={() => setCurrentPage('home')}
        >
          <span>🏠</span><br/>בית
        </button>
      </footer>
    </div>
  );
}

export default App;