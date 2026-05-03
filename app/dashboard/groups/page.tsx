'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardData } from '../../../lib/api';

export default function GroupsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const { groups } = await getDashboardData();
        setGroups(groups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
      setLoading(false);
    };
    fetchGroups();
  }, []);

  return (
    <div style={{ backgroundColor: '#f7f9fe', minHeight: '100vh', direction: 'rtl', fontFamily: 'Inter, sans-serif', padding: '40px 20px 140px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* כותרת וכפתור הוספה */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#003643', margin: 0 }}>הקבוצות שלי</h1>
          <button 
            onClick={() => router.push('/groups/new')}
            style={{ backgroundColor: '#003643', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined">add</span>
            קבוצה חדשה
          </button>
        </div>

        {/* רשימת הקבוצות */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '20px' 
        }}>
          {groups.length > 0 ? (
            groups.map((group: any) => (
              <GroupCard 
                key={group.id} 
                title={group.name} 
                participants={group.participants_count}
                onClick={() => router.push(`/groups/${group.id}`)} 
              />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '32px', color: '#999', border: '1px solid #f1f4f8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px', marginBottom: '15px' }}>folder_open</span>
              <p style={{ fontSize: '18px' }}>עדיין אין קבוצות רשומות.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// קומפוננטת הכרטיסייה (הועברה לכאן)
function GroupCard({ title, participants, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '24px', 
        border: '1px solid #f1f4f8', 
        textAlign: 'right', 
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}
    >
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#003643', margin: 0 }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', marginTop: '10px' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>{participants} משתתפים</span>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#999' }}>groups</span>
      </div>
    </div>
  );
}