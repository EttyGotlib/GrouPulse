"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSettingsPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "עדו המנחה",
    title: "עו\"ס קליני | מנחה קבוצות",
    email: "ido@example.com",
    phone: "050-1234567"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen font-sans text-[#181c1f] pb-20">
      
      {/* Header - עם כפתור חזרה להגדרות */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex flex-row-reverse justify-between items-center w-full px-6 h-16 border-b border-slate-100">
        <h1 className="font-bold text-lg text-[#003643]">פרטים אישיים</h1>
        <button 
          onClick={() => router.back()} 
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-10 pb-32">
                
        {/* תמונת פרופיל ועריכה מהירה */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-[#003643] flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
              {formData.fullName.charAt(0)}
            </div>
            <label className="absolute bottom-1 right-1 bg-[#32666d] text-white p-2 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              <input type="file" className="hidden" />
            </label>
          </div>
          <p className="mt-4 text-xs font-bold text-[#32666d]">לחץ להחלפת תמונה</p>
        </div>

        {/* שדות הטופס */}
        <div className="space-y-6">
          
          {/* שם מלא */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 pr-2 uppercase">שם מלא</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold text-[#003643] focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm transition-all"
            />
          </div>

          {/* תואר מקצועי */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 pr-2 uppercase">תואר מקצועי</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold text-[#003643] focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm transition-all"
            />
          </div>

          {/* אימייל */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 pr-2 uppercase">אימייל</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold text-[#003643] focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm transition-all"
              dir="ltr"
            />
          </div>

          {/* טלפון */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 pr-2 uppercase">טלפון</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold text-[#003643] focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm transition-all"
              dir="ltr"
            />
          </div>

        </div>

        {/* כפתור שמירה */}
        <button 
          onClick={() => {
            alert('השינויים עודכנו בהצלחה במערכת');
            router.push('/settings');
          }}
          className="w-full mt-10 py-5 bg-[#003643] text-white rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform"
        >
          שמור שינויים
        </button>

      </main>
    </div>
  );
}