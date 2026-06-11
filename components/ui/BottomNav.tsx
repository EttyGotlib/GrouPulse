'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const hideOnPages = ['/login', '/register', '/']; 
  
  if (hideOnPages.includes(pathname)) {
    return null; 
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* התיקון הסופי: הזרקת CSS שדואג להעלים את הסרגל בזמן הדפסה בלבד */}
      <style>{`
        @media print {
          .force-hide-on-print {
            display: none !important;
          }
        }
      `}</style>

      <nav 
        className="force-hide-on-print" 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '100%', 
          maxWidth: '1200px', 
          backgroundColor: 'white', 
          display: 'flex', 
          justifyContent: 'space-around', 
          padding: '15px 10px 30px', 
          borderTop: '1px solid #eee', 
          borderRadius: '30px 30px 0 0', 
          zIndex: 1000,
          boxShadow: '0 -5px 20px rgba(0,0,0,0.05)'
        }}
      >
        {/* כפתור בית - כעת ממוקם בצד ימין קיצוני */}
        <NavItem 
          icon="home" 
          label="בית" 
          active={isActive('/dashboard')} 
          onClick={() => router.push('/dashboard')} 
        />

        {/* כפתור "הקבוצות שלי" מאוחד - מופיע שני מימין */}
        <NavItem 
          icon="group" 
          label="הקבוצות שלי" 
          active={
            pathname.includes('/groups') || 
            pathname.includes('/participants') || 
            pathname === '/dashboard/groups'
          } 
          onClick={() => router.push('/dashboard/groups')} 
        />

        {/* כפתור יומן - מופיע במרכז */}
        <NavItem 
          icon="calendar_month" 
          label="יומן" 
          active={isActive('/calendar')} 
          onClick={() => router.push('/calendar')} 
        />
        
        {/* כפתור אנליטיקות - מופיע שני משמאל */}
        <NavItem 
          icon="analytics" 
          label="אנליטיקות" 
          active={isActive('/analytics')} 
          onClick={() => router.push('/analytics')} 
        />

        {/* כפתור הגדרות - כעת ממוקם בצד שמאל קיצוני, בדיוק כמו במוסד */}
        <NavItem 
          icon="settings" 
          label="הגדרות" 
          active={isActive('/settings')} 
          onClick={() => router.push('/settings')} 
        />
      </nav>
    </>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignDirection: 'rtl',
        alignItems: 'center', 
        gap: '5px', 
        color: active ? '#003643' : '#999', 
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: active ? 'scale(1.1)' : 'scale(1)'
      }}
    >
      <span className="material-symbols-outlined" style={{ 
        fontSize: '28px',
        fontVariationSettings: active ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400"
      }}>
        {icon}
      </span>
      <span style={{ 
        fontSize: '11px', 
        fontWeight: active ? '800' : '500',
        opacity: active ? 1 : 0.7 
      }}>
        {label}
      </span>
      {active && (
        <div style={{ 
          width: '4px', 
          height: '4px', 
          backgroundColor: '#003643', 
          borderRadius: '50%',
          marginTop: '2px' 
        }}></div>
      )}
    </div>
  );
}