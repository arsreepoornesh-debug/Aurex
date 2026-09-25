'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, ChevronLeft, CheckCircle2, Clock } from 'lucide-react';

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/clients/AUR-2026-0001');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/portal" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900">Notifications & Alerts</h1>
        <p className="text-xs text-slate-500">Booking confirmations, session updates, and package reminders</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No new notifications.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">{n.message}</p>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(n.scheduledAt || n.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
