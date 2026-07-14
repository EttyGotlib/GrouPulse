'use client';
/**
 * InstituteLayout Component
 *
 * Layout wrapper for institute-related pages.
 * Provides a consistent UI structure including header, navigation, and content area.
 *
 * Features:
 * - Sticky top header with app branding
 * - Centered content container with max width
 * - Bottom navigation bar for institute sections
 * - RTL layout support and global styling
 * - Renders nested pages via children prop
 *
 * Used as the main layout for all institute dashboard screens.
 */
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

        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '18px 24px', 
          backgroundColor: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(10px)', 
          position: 'sticky', 
          top: 0, 
          zIndex: 100,
          borderBottom: '1px solid #f1f4f8' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
             <div style={{ 
               width: '48px', 
               height: '48px', 
               borderRadius: '50%', 
               backgroundColor: '#003643', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               color: 'white', 
               fontWeight: '900', 
               fontSize: '22px' 
             }}>
               G
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
               <span style={{ fontWeight: '800', color: '#003643', fontSize: '22px', lineHeight: '1.1' }}>GrouPulse</span>
               <span style={{ color: '#a1aab0', fontSize: '13px', fontWeight: '800', marginTop: '3px' }}>מוסדות</span>
             </div>
          </div>
        </header>

        <main style={{ padding: '40px 20px 140px 20px' }}>
          {children}
        </main>

        <InstituteNav />
        
      </div>
    </div>
  );
}