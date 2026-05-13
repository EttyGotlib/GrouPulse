"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAndUpdatePassword } from '../../../lib/api';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      alert("נא למלא את כל השדות");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      alert("הסיסמה החדשה והאימות אינם תואמים");
      return;
    }

    setLoading(true);
    // שליחה לפונקציית האימות והעדכון המשולבת
    const result = await verifyAndUpdatePassword(passwords.current, passwords.new);
    
    if (result.success) {
      alert("הסיסמה עודכנה בהצלחה!");
      router.push('/settings');
    } else {
      alert("שגיאה: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" className="bg-[#f7f9fe] min-h-screen font-sans text-[#181c1f] pb-20">
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex flex-row-reverse justify-between items-center w-full px-6 h-16 border-b border-slate-100">
        <h1 className="font-bold text-lg text-[#003643]">אבטחה</h1>
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-10 pb-32">
        <section className="mb-10">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">אימות ושינוי סיסמה</h3>
          
          <div className="space-y-4">
            {/* סיסמה נוכחית - חובה לאבטחה */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#003643] pr-2">סיסמה נוכחית</label>
              <input 
                type="password" 
                name="current"
                value={passwords.current}
                onChange={handleChange}
                placeholder="הזן סיסמה קיימת"
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm transition-all"
              />
            </div>

            <div className="h-px bg-slate-100 my-2 mx-4"></div>

            {/* סיסמה חדשה */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#003643] pr-2">סיסמה חדשה</label>
              <input 
                type="password" 
                name="new"
                value={passwords.new}
                onChange={handleChange}
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm transition-all"
              />
            </div>

            {/* אימות סיסמה */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#003643] pr-2">אימות סיסמה חדשה</label>
              <input 
                type="password" 
                name="confirm"
                value={passwords.confirm}
                onChange={handleChange}
                className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#32666d] focus:outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            onClick={handleUpdate}
            className={`w-full mt-8 py-4 ${loading ? 'bg-slate-400' : 'bg-[#003643]'} text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all`}
          >
            {loading ? "מאמת ומעדכן..." : "אשר ועדכן סיסמה"}
          </button>
        </section>
      </main>
    </div>
  );
}