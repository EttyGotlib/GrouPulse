"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ודאי שהנתיב ל-API נכון לפי מבנה התיקיות שלך
import { getCurrentUserInfo, updateUserInfo } from '../../../lib/api'; 

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    email: ""
  });

  // טעינת נתונים אמיתיים בכניסה לדף
  useEffect(() => {
    async function loadData() {
      const result = await getCurrentUserInfo();
      if (result.success) {
        setFormData({
          fullName: result.data.fullName,
          title: result.data.role,
          email: result.data.email
        });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateUserInfo(formData);
    
    if (result.success) {
      alert('הפרטים עודכנו בהצלחה!');
      router.push('/settings');
    } else {
      alert('שגיאה בעדכון הפרטים: ' + result.error);
    }
    setIsSaving(false);
  };

  if (loading) return <div className="text-center pt-20 font-bold">טוען נתונים...</div>;

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen font-sans text-[#181c1f] pb-20">
      
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex flex-row-reverse justify-between items-center w-full px-6 h-16 border-b border-slate-100">
        <h1 className="font-bold text-lg text-[#003643]">פרטים אישיים</h1>
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-10 pb-32">
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-[#003643] flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
              {formData.fullName?.charAt(0) || "?"}
            </div>
          </div>
        </div>

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

          {/* אימייל - לקריאה בלבד בדרך כלל ב-Supabase Auth ללא תהליך אימות נוסף */}
          <div className="flex flex-col gap-2 opacity-60">
            <label className="text-xs font-black text-slate-400 pr-2 uppercase">אימייל </label>
            <input 
              type="email" 
              value={formData.email}
              readOnly
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-500 cursor-not-allowed"
              dir="ltr"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full mt-10 py-5 ${isSaving ? 'bg-slate-400' : 'bg-[#003643]'} text-white rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform`}
        >
          {isSaving ? 'שומר שינויים...' : 'שמור שינויים'}
        </button>
      </main>
    </div>
  );
}