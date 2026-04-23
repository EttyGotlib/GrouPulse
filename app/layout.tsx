import './globals.css'
import type { Metadata } from 'next'
import BottomNav from '../components/BottomNav'

export const metadata: Metadata = {
  title: 'GrouPulse',
  description: 'ניהול טיפולים קבוצתיים',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0 }}>
        {/* התוכן של הדפים */}
        <main style={{ minHeight: '100vh' }}>
          {children}
        </main>

        {/* הסרגל שיופיע בכל דף */}
        <BottomNav />
      </body>
    </html>
  )
}