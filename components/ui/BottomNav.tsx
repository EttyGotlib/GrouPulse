'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Layers, Calendar, BarChart2, Settings } from 'lucide-react';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // הסרגל המקורי, האמיתי והנכון של המנחה
  const navItems = [
    { label: 'לוח בקרה', path: '/dashboard', icon: LayoutDashboard },
    { label: 'הקבוצות שלי', path: '/dashboard/groups', icon: Layers },
    { label: 'לו"ז', path: '/calendar', icon: Calendar },
    { label: 'אנליטיקס', path: '/analytics', icon: BarChart2 },
    { label: 'הגדרות', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50 md:py-2" dir="rtl">
      <div className="max-w-md mx-auto md:max-w-4xl px-4 flex items-center justify-around h-16 md:h-20">
        
        {navItems.map((item) => {
          const Icon = item.icon;
          // בדיקה מדויקת של הטאב הפעיל כפי שהיה לכם
          const isActive = item.path === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname?.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all text-center ${
                isActive 
                  ? 'text-[#003643] font-black scale-105' 
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-zinc-50' : ''}`}>
                <Icon size={22} />
              </div>
              <span className={`text-[11px] md:text-xs ${isActive ? 'font-black' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

      </div>
    </div>
  );
}