'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Layers, UserCheck, BarChart3, Settings } from 'lucide-react';

export default function InstituteNav() {
  const router = useRouter();
  const pathname = usePathname();

  // מערך הטאבים המדויק של המוסד
  const navItems = [
    { label: 'לוח בקרה', path: '/institute', icon: LayoutDashboard },
    { label: 'צוות המנחים', path: '/institute/moderators', icon: Users },
    { label: 'ניהול קבוצות', path: '/institute/groups', icon: Layers },
    { label: 'מאגר מטופלים', path: '/institute/participants', icon: UserCheck },
    // מוביל לדף האנליטיקה הכללי עם סימון שהמשתמש הוא מוסד
    { label: 'אנליטיקות', path: '/analytics?userType=institute', icon: BarChart3 },
    { label: 'הגדרות מוסד', path: '/settings?userType=institute', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50 py-2" dir="rtl">
      <div className="max-w-md mx-auto md:max-w-4xl px-4 flex items-center justify-around h-16 md:h-20">
        
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // בדיקה דינמית וחכמה האם הטאב פעיל (תומכת גם בדפים פנימיים וגם בפרמטרי URL)
          const isActive = 
            pathname === item.path || 
            (item.path.startsWith('/analytics') && pathname === '/analytics') ||
            (item.path.includes('participants') && pathname.includes('participants')) ||
            (item.path.includes('settings') && pathname.includes('settings'));

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all text-center animate-none bg-transparent border-none cursor-pointer"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-zinc-50 text-[#003643]' : 'text-zinc-400 hover:text-zinc-600'}`}>
                <Icon size={22} />
              </div>
              <span className={`text-[11px] md:text-xs transition-all ${
                isActive ? 'text-[#003643] font-black scale-105' : 'text-zinc-400 font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}

      </div>
    </div>
  );
}