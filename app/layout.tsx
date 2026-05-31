'use client';

import './globals.css'
import BottomNav from '../components/ui/BottomNav'
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  // רשימת הדפים שבהם לא נציג את הסרגל בכלל (כמו דפי כניסה והרשמה)
  const noNavPages = ['/login', '/register', '/reset-password'];
  
  // המנחה יראה את הסרגל שלו בכל הדפים הרגילים, חוץ מדפי התחברות ומדפי המוסד
  const isInstitutePage = pathname?.startsWith('/institute');
  const showNav = !noNavPages.includes(pathname) && !isInstitutePage;

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

        {showNav && <BottomNav />}
      </body>
    </html>
  )
}