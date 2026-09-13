'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  PlusCircle, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Check, 
  X,
  Stethoscope,
  Sparkles,
  Layers
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const TIME_SLOTS = [
  '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM'
];

export default function BookingsPage() {
  const [selectedDate, setSelectedDate] = useState('2026-09-13');
  const [sessions, setSessions] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialistTab, setSelectedSpecialistTab] = useState('ALL');
  const [viewMode, setViewMode] = useState<'DAY' | 'WEEK' | 'MONTH'>('DAY');
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const [slotForm, setSlotForm] = useState({
    title: '',
    startTime: '08:00 AM',
    endTime: '09:00 AM',
    serviceType: 'SEMI_PRIVATE',
    specialistId: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [sessRes, specRes, clientRes] = await Promise.all([
        fetch(`/api/sessions?date=${selectedDate}`),
        fetch('/api/specialists'),
        fetch('/api/clients'),
      ]);

      const sData = await sessRes.json();
      const spData = await specRes.json();
      const clData = await clientRes.json();

      setSessions(Array.isArray(sData) ? sData : []);
      setSpecialists(Array.isArray(spData) ? spData : []);
      setClients(Array.isArray(clData) ? clData : []);

      if (spData.length > 0 && !slotForm.specialistId) {
        setSlotForm((prev) => ({ ...prev, specialistId: spData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  function showMsg(type: 'success' | 'error', text: string) {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  }

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...slotForm,
          date: selectedDate,
        }),
      });

      if (res.ok) {
        showMsg('success', 'Session slot created!');
        setShowAddSlotModal(false);
        loadData();
      } else {
        const err = await res.json();
        showMsg('error', err.error || 'Failed to create slot');
      }
    } catch (err) {
      showMsg('error', 'Error creating slot');
    }
  };

  const handleEnrollClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          clientId: selectedClientId,
        }),
      });

      if (res.ok) {
        showMsg('success', 'Client booked into slot!');
        setShowEnrollModal(false);
        setSelectedClientId('');
        loadData();
      } else {
        const err = await res.json();
        showMsg('error', err.error || 'Failed to enroll client');
      }
    } catch (err) {
      showMsg('error', 'Error booking client');
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    if (!confirm('Mark session complete? This will decrement 1 session for all present clients.')) return;
    try {
      const res = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        showMsg('success', 'Session completed! Balances decremented.');
        loadData();
      } else {
        const err = await res.json();
        showMsg('error', err.error || 'Failed to complete session');
      }
    } catch (err) {
      showMsg('error', 'Error completing session');
    }
  };

  const handleMarkAttendance = async (sessionId: string, clientId: string, status: string) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, clientId, status }),
      });

      if (res.ok) {
        showMsg('success', `Marked ${status}`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter specialists for columns
  const activeSpecialists =
    selectedSpecialistTab === 'ALL'
      ? specialists
      : specialists.filter((s) => s.id === selectedSpecialistTab);

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in-50 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Date Selector & Nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddSlotModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Book Slot</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded hover:bg-white text-slate-700 transition"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 select-none">
              {new Date(selectedDate).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <button
              onClick={handleNextDay}
              className="p-1 rounded hover:bg-white text-slate-700 transition"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Toggle & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for Student, Name, Contact No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded pl-7 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none w-56 sm:w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-xs font-bold">
            {(['DAY', 'WEEK', 'MONTH'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded transition text-[11px] ${
                  viewMode === mode
                    ? 'bg-[#1e40af] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Specialist Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedSpecialistTab('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap border ${
            selectedSpecialistTab === 'ALL'
              ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Specialists ({specialists.length})
        </button>
        {specialists.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSpecialistTab(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 border ${
              selectedSpecialistTab === s.id
                ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.colorCode }} />
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      {/* Schedule Calendar Grid (Day View) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header: Specialist Columns */}
        <div className="grid grid-cols-[100px_repeat(auto-fit,minmax(240px,1fr))] border-b border-slate-200 bg-[#1e40af] text-white font-bold text-xs uppercase tracking-wider">
          <div className="p-3 border-r border-blue-800 text-center">Time Slot</div>
          {activeSpecialists.map((s) => (
            <div key={s.id} className="p-3 border-r border-blue-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                {s.name}
              </span>
              <span className="text-[10px] text-blue-200 font-normal lowercase">{s.specialization}</span>
            </div>
          ))}
        </div>

        {/* Schedule Time Rows */}
        <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
          {TIME_SLOTS.map((time) => {
            return (
              <div
                key={time}
                className="grid grid-cols-[100px_repeat(auto-fit,minmax(240px,1fr))] min-h-[72px] hover:bg-slate-50/40 transition-colors"
              >
                {/* Time Label Left */}
                <div className="p-2.5 border-r border-slate-200 text-[11px] font-mono font-bold text-slate-500 bg-slate-50/70 flex items-center justify-center">
                  {time}
                </div>

                {/* Specialist Cells */}
                {activeSpecialists.map((specialist) => {
                  const matchingSession = sessions.find((s) => {
                    const matchTime = s.startTime.includes(time.slice(0, 5)) || s.startTime === time;
                    const matchSpec = s.specialistId === specialist.id;
                    return matchTime && matchSpec;
                  });

                  if (matchingSession) {
                    const bookedCount = matchingSession.bookings?.length || 0;
                    const maxCap = matchingSession.maxCapacity || 4;
                    const isFull = bookedCount >= maxCap;
                    const isCompleted = matchingSession.status === 'COMPLETED';

                    return (
                      <div
                        key={specialist.id}
                        className="p-2 border-r border-slate-100 bg-emerald-50/30 flex flex-col justify-between gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {matchingSession.title || `${matchingSession.serviceType.replace('_', ' ')} Slot`}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {bookedCount}/{maxCap} {isFull && 'FULL'}
                          </span>
                        </div>

                        {/* Enrolled client tags */}
                        <div className="flex flex-wrap gap-1">
                          {matchingSession.bookings?.map((b: any) => {
                            const att = matchingSession.attendances?.find((a: any) => a.clientId === b.clientId);
                            return (
                              <div
                                key={b.id}
                                className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-medium text-slate-800 flex items-center gap-1 shadow-2xs"
                              >
                                <span>{b.client?.name}</span>
                                {att?.status === 'PRESENT' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 text-[10px]">
                          {!isFull && !isCompleted && (
                            <button
                              onClick={() => {
                                setSelectedSessionId(matchingSession.id);
                                setShowEnrollModal(true);
                              }}
                              className="text-blue-600 font-bold hover:underline"
                            >
                              + Enroll
                            </button>
                          )}
                          {!isCompleted && (
                            <button
                              onClick={() => handleCompleteSession(matchingSession.id)}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition ml-auto"
                            >
                              Complete Session
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Empty Slot (Clickable to create session)
                  return (
                    <div
                      key={specialist.id}
                      onClick={() => {
                        setSlotForm({
                          ...slotForm,
                          startTime: time,
                          specialistId: specialist.id,
                        });
                        setShowAddSlotModal(true);
                      }}
                      className="p-2 border-r border-slate-100 flex items-center justify-center text-slate-300 hover:bg-blue-50/50 hover:text-blue-500 cursor-pointer transition text-xs font-semibold group select-none"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition">+ Open Slot</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Session Slot */}
      {showAddSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Schedule Session Slot
              </span>
              <button onClick={() => setShowAddSlotModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Morning Semi-Private Batch A"
                  value={slotForm.title}
                  onChange={(e) => setSlotForm({ ...slotForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Type</label>
                <select
                  value={slotForm.serviceType}
                  onChange={(e) => setSlotForm({ ...slotForm, serviceType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value="SEMI_PRIVATE">Semi-Private (Max 4 Clients)</option>
                  <option value="PREMIUM">Premium (1:1 Max 1 Client)</option>
                  <option value="ASSESSMENT">Clinical Assessment (1:1)</option>
                  <option value="CONSULTATION">Doctor Consultation (1:1)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Specialist</label>
                <select
                  value={slotForm.specialistId}
                  onChange={(e) => setSlotForm({ ...slotForm, specialistId: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-medium"
                >
                  {specialists.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow transition"
                >
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Client into Slot */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Enroll Client into Slot
              </span>
              <button onClick={() => setShowEnrollModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollClient} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Client (Atomic Capacity Enforced)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-medium"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.clientId}) — {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow transition"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
