'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage('שגיאה בעדכון הסיסמה: ' + error.message);
    } else {
      alert('הסיסמה עודכנה בהצלחה!');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fe] p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#003643] mb-6 text-right">בחירת סיסמה חדשה</h1>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <input 
            type="password"
            placeholder="סיסמה חדשה"
            className="w-full bg-gray-100 p-4 rounded-xl text-right outline-none focus:ring-2 focus:ring-[#a0cdde]"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#003643] text-white py-4 rounded-xl font-bold"
          >
            עדכן סיסמה
          </button>
          {message && <p className="text-center text-sm mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
}