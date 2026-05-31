'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { getModeratorsByInstitute } from '../../../lib/api';

export default function ModeratorsPage() {
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModerators() {
      try {
        const res = await getModeratorsByInstitute();
        if (res.success) {
          setModerators(res.data);
        }
      } catch (err) {
        console.error("שגיאה בטעינת מנחי המוסד:", err);
      } finally {
        setLoading(false);
      }
    }
    loadModerators();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-right" dir="rtl">
      <div className="flex items-center gap-3 justify-start mb-6">
        <Users className="text-[#003643]" size={28} />
        <h1 className="text-2xl font-black text-[#003643]">צוות המנחים במכון</h1>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-center p-8 text-zinc-500 text-sm">טוען את צוות המנחים...</p>
        ) : moderators.length === 0 ? (
          <p className="text-center p-8 text-zinc-500 text-sm">לא נמצאו מנחים רשומים במוסד.</p>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-zinc-500 text-sm">
                <th className="p-4 font-bold">שם המנחה</th>
                <th className="p-4 font-bold">אימייל</th>
                <th className="p-4 font-bold">התמחות / תפקיד</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-zinc-700">
              {moderators.map((mod) => (
                <tr key={mod.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 font-bold text-[#003643]">{mod.full_name || mod.display_name}</td>
                  <td className="p-4">{mod.email || 'אין אימייל'}</td>
                  <td className="p-4">
                    <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {mod.role === 'moderator' ? 'מנחה מוסמך' : mod.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}