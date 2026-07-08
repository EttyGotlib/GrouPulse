'use client';
/**
 * GroupsPage Component
 *
 * Displays an institute dashboard of all groups.
 * Fetches groups data from the backend and renders a simple overview list.
 *
 * Features:
 * - Fetch groups from API on mount
 * - Loading and empty states handling
 * - Display group name, description, and participant count
 * - Responsive grid layout for group cards
 *
 * Uses a single API call to load all group data.
 */

import { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { getRealInstituteDashboardRealData } from '../../../lib/api'; // ודאי שנתיב הייבוא נכון לפרויקט שלך

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await getRealInstituteDashboardRealData();
        if (res.success) {
          setGroups(res.data.groups);
        }
      } catch (err) {
        console.error("שגיאה בטעינת קבוצות המוסד:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGroups();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-right" dir="rtl">
      <div className="flex items-center gap-3 justify-start mb-6">
        <Layers className="text-[#003643]" size={28} />
        <h1 className="text-2xl font-black text-[#003643]">ניהול קבוצות המכון</h1>
      </div>

      {loading ? (
        <p className="text-center text-zinc-500 text-sm">טוען נתונים מהשרת...</p>
      ) : groups.length === 0 ? (
        <p className="text-center text-zinc-500 text-sm">לא נמצאו קבוצות פעילות במוסד.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-start flex-row-reverse">
                <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-full">
                  פעילה
                </span>
                <h3 className="text-lg font-black text-[#003643]">{group.name}</h3>
              </div>
              <div className="text-sm text-zinc-500 space-y-1">
                <p>תיאור: <span className="font-semibold text-zinc-700">{group.description || 'אין תיאור'}</span></p>
                <p>מספר משתתפים: <span className="font-semibold text-zinc-700">{group.participants_count || 0} מטופלים</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}