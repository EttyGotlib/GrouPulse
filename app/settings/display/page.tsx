"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InstituteNav from '../../../components/ui/InstituteNav'; 

function DisplaySettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType'); 
  
  const [theme, setTheme] = useState('light'); 

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen font-sans text-[#181c1f] flex flex-col">
      
      {}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex flex-row-reverse justify-between items-center w-full px-6 h-16 border-b border-slate-100 shrink-0">
        <h1 className="font-bold text-lg text-[#003643]">תצוגה</h1>
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-10 pb-40 flex-1 w-full">
        
        {}
        <section className="mb-8">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">ערכת נושא</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {}
            <div 
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${theme === 'light' ? 'border-[#32666d] bg-white shadow-md' : 'border-transparent bg-slate-100/50'}`}
            >
              <div className="w-full h-12 bg-white border border-slate-200 rounded-lg shadow-inner"></div>
              <span className="text-xs font-bold text-[#003643]">בהיר</span>
            </div>

            {}
            <div 
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${theme === 'dark' ? 'border-[#32666d] bg-[#003643] shadow-md' : 'border-transparent bg-slate-100/50'}`}
            >
              <div className="w-full h-12 bg-[#1e4d5b] border border-slate-700 rounded-lg shadow-inner"></div>
              <span className="text-xs font-bold text-[#003643]">כהה</span>
            </div>

            {}
            <div 
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${theme === 'system' ? 'border-[#32666d] bg-white shadow-md' : 'border-transparent bg-slate-100/50'}`}
            >
              <div className="w-full h-12 bg-gradient-to-l from-white to-[#003643] border border-slate-200 rounded-lg shadow-inner"></div>
              <span className="text-xs font-bold text-[#003643]">מערכת</span>
            </div>
          </div>
        </section>

        {}
        <section>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">נגישות</h3>
          <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-50">
            <div className="flex flex-row-reverse justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-[#003643]">גודל טקסט</h4>
              <span className="text-xs text-slate-400">בינוני</span>
            </div>
            {}
            <div className="relative h-2 bg-slate-100 rounded-full w-full">
              <div className="absolute right-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#32666d] rounded-full shadow-lg border-2 border-white"></div>
            </div>
            <div className="flex flex-row-reverse justify-between mt-4 px-1">
              <span className="text-[10px] text-slate-400 font-bold">א</span>
              <span className="text-lg text-slate-400 font-bold">א</span>
            </div>
          </div>
        </section>

      </main>

      {}
      {userType === 'institute' && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            /* מסתיר את הסרגל התחתון הכללי של המנחה שמגיע מה-Layout */
            nav, footer, [class*="Navbar"], [class*="navbar"] {
              display: none !important;
            }
          ` }} />
          
          <InstituteNav />
        </>
      )}

    </div>
  );
}

export default function DisplaySettingsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-[#003643]">טוען הגדרות תצוגה...</div>}>
      <DisplaySettingsContent />
    </Suspense>
  );
}