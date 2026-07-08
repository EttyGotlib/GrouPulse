'use client';
/**
 * ParticipantsPage Component
 *
 * Displays an institutional registry of participants.
 * Fetches participant data from backend and renders a structured table.
 *
 * Features:
 * - Load participants list on mount
 * - Handle loading and empty states
 * - Display name, group, ID, and email
 * - Clickable participant name linking to profile page
 * - Clean tabular layout for institutional overview
 */

import { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { getRealInstituteParticipants } from '../../../lib/api';
import Link from 'next/link';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParticipants() {
      try {
        const res = await getRealInstituteParticipants();
        if (res.success) {
          setParticipants(res.data);
        }
      } catch (err) {
        console.error("שגיאה בטעינת המטופלים:", err);
      } finally {
        setLoading(false);
      }
    }
    loadParticipants();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-right" dir="rtl">
      <div className="flex items-center gap-3 justify-start mb-6">
        <UserCheck className="text-[#003643]" size={28} />
        <h1 className="text-2xl font-black text-[#003643]">מאגר מטופלים מוסדי</h1>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-center p-8 text-zinc-500 text-sm">טוען את מאגר המטופלים...</p>
        ) : participants.length === 0 ? (
          <p className="text-center p-8 text-zinc-500 text-sm">לא נמצאו מטופלים רשומים בקבוצות המוסד.</p>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-zinc-500 text-sm">
                <th className="p-4 font-bold">שם המטופל</th>
                <th className="p-4 font-bold">קבוצה משויכת</th>
                <th className="p-4 font-bold">תעודת זהות / קוד</th>
                <th className="p-4 font-bold">אימייל</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-zinc-700">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 font-bold text-[#003643]">
                    <Link href={`/participants/${p.id}?viewAs=institute&userType=institute`}>
                      {p.name_or_code}
                    </Link>
                  </td>
                  <td className="p-4">{p.group_name}</td>
                  <td className="p-4 text-zinc-500">{p.identity_number || 'לא הוגדר'}</td>
                  <td className="p-4 text-zinc-500 text-sm">{p.email || 'אין אימייל'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}