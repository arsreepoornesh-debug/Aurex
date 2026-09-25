'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle2, ChevronLeft, ShieldAlert, Sparkles } from 'lucide-react';

export default function BookSessionPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadAvailableSlots() {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/bookings?date=${todayStr}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  async function handleBookSlot(sessionId: string) {
    setBookingLoading(sessionId);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Find Puneesh's client ID
      const clientRes = await fetch('/api/clients/AUR-2026-0001');
      const client = await clientRes.json();

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          clientId: client.id,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMessage(resData.error || 'Unable to book this slot.');
      } else {
        setSuccessMessage('🎉 Session booked successfully! A confirmation notification has been sent.');
        await loadAvailableSlots();
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to book slot.');
    } finally {
      setBookingLoading(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/portal" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900">Book Clinical Session</h1>
        <p className="text-xs text-slate-500">Select an available slot matching your active Semi-Private package</p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-slate-400 text-xs">Loading available slots...</div>
        ) : sessions.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-slate-500 text-xs">No slots available for today.</div>
        ) : (
          sessions.map((slot) => {
            const isFull = (slot.bookings?.length || 0) >= slot.maxCapacity;

            return (
              <div
                key={slot.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-emerald-500 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {slot.startTime} – {slot.endTime}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isFull
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}
                  >
                    {isFull ? 'FULL (4/4)' : `${slot.bookings?.length || 0}/${slot.maxCapacity} Booked`}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{slot.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Specialist: {slot.specialist?.name}</p>
                </div>

                <button
                  onClick={() => handleBookSlot(slot.id)}
                  disabled={isFull || bookingLoading === slot.id}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isFull
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  {bookingLoading === slot.id
                    ? 'Reserving...'
                    : isFull
                    ? 'Slot Full (4/4)'
                    : 'Confirm Booking'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
