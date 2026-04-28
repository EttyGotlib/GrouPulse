'use client'; // שורה 1: הוספת הגדרת צד-לקוח

import './globals.css'
import type { Metadata } from 'next'
import BottomNav from '../components/BottomNav'
import { usePathname } from 'next/navigation'; // הוספת הייבוא הזה

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname(); // הגדרת המשתנה שבודק איפה אנחנו נמצאים

  // רשימת הדפים שבהם לא נציג את הסרגל
  const noNavPages = ['/login', '/register', '/reset-password'];
  const showNav = !noNavPages.includes(pathname);

  return (
    <html lang="he" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0 }}>
        <main style={{ minHeight: '100vh' }}>
          {children}
        </main>

        {/* שורה שונתה: הסרגל יופיע רק אם showNav הוא true */}
        {showNav && <BottomNav />}
      </body>
    </html>
  )
}