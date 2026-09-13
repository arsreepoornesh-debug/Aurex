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
  Layers,
  UserCheck,
  CalendarDays,
  Repeat
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Header } from '@/components/layout/Header';

// Helper: Get Monday of current week
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

export default function BookingsPage() {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [selectedWeekdayIndex, setSelectedWeekdayIndex] = useState(0); // 0: Mon, 1: Tue, 2: Wed, 3: Thu, 4: Fri
  const [sessions, setSessions] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  // Form: Single Slot
  const [slotForm, setSlotForm] = useState({
    title: '',
    startTime: '08:00',
    endTime: '09:00',
    serviceType: 'SEMI_PRIVATE',
    specialistId: '',
    maxCapacity: 4,
  });

  // Form: Multi-Session / Recurring Weekday Booking
  const [recurringForm, setRecurringForm] = useState({
    clientId: '',
    frequency: '2X_WEEK', // '2X_WEEK' (Mon/Wed), '3X_WEEK' (Mon/Wed/Fri), '5X_WEEK' (Mon-Fri)
    serviceType: 'SEMI_PRIVATE',
    timeSlot: '08:00',
    specialistId: '',
    durationWeeks: 4,
  });

  const [enrollForm, setEnrollForm] = useState({
    clientId: '',
  });

  // Generate 5 Weekdays (Mon-Fri, excluding Sat/Sun)
  const weekdays = [0, 1, 2, 3, 4].map((offset) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + offset);
    return {
      dateObj: d,
      dateStr: d.toISOString().split('T')[0],
      dayName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][offset],
      shortName: ['MON', 'TUE', 'WED', 'THU', 'FRI'][offset],
      dayNum: d.getDate(),
      monthName: d.toLocaleString('default', { month: 'short' }),
    };
  });

  const selectedDateStr = weekdays[selectedWeekdayIndex]?.dateStr || new Date().toISOString().split('T')[0];

  async function loadData() {
    setLoading(true);
    try {
      const [sessRes, specRes, clientRes] = await Promise.all([
        fetch(`/api/sessions?date=${selectedDateStr}`),
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
        setRecurringForm((prev) => ({ ...prev, specialistId: spData[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedDateStr, currentMonday]);

  const handlePrevWeek = () => {
    const nextMon = new Date(currentMonday);
    nextMon.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(nextMon);
  };

  const handleNextWeek = () => {
    const nextMon = new Date(currentMonday);
    nextMon.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(nextMon);
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const maxCap = slotForm.serviceType === 'PREMIUM' ? 1 : slotForm.serviceType === 'SEMI_PRIVATE' ? 4 : 8;
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...slotForm,
          date: selectedDateStr,
          maxCapacity: maxCap,
          title: slotForm.title || `${slotForm.serviceType === 'PREMIUM' ? 'Private 1:1' : 'Semi-Private 1:4'} Session`,
        }),
      });

      if (res.ok) {
        setShowAddSlotModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create slot');
      }
    } catch (err) {
      alert('Error creating slot');
    }
  };

  const handleEnrollClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.clientId || !selectedSessionId) {
      alert('Please select a client.');
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          clientId: enrollForm.clientId,
        }),
      });

      if (res.ok) {
        setShowEnrollModal(false);
        setEnrollForm({ clientId: '' });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to book client into session');
      }
    } catch (err) {
      alert('Error booking client');
    }
  };

  const handleRecurringBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recurringForm.clientId) {
      alert('Please select a client.');
      return;
    }

    // Determine days of week based on pattern
    // 2X_WEEK: Monday & Wednesday (days 0 & 2)
    // 3X_WEEK: Monday, Wednesday, Friday (days 0, 2, 4)
    // 5X_WEEK: Monday to Friday (days 0, 1, 2, 3, 4)
    let dayOffsets = [0, 2]; // Default 2x: Monday & Wednesday
    if (recurringForm.frequency === '3X_WEEK') dayOffsets = [0, 2, 4];
    if (recurringForm.frequency === '5X_WEEK') dayOffsets = [0, 1, 2, 3, 4];

    try {
      // Loop across weeks and create/book sessions
      const bookingPromises: Promise<any>[] = [];

      for (let week = 0; week < recurringForm.durationWeeks; week++) {
        for (const dayOffset of dayOffsets) {
          const sessionDate = new Date(currentMonday);
          sessionDate.setDate(currentMonday.getDate() + (week * 7) + dayOffset);
          const dateString = sessionDate.toISOString().split('T')[0];

          // Create session slot & book
          const maxCap = recurringForm.serviceType === 'PREMIUM' ? 1 : 4;
          const promise = fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `${recurringForm.serviceType === 'PREMIUM' ? 'Private 1:1' : 'Semi-Private 1:4'} Session`,
              date: dateString,
              startTime: recurringForm.timeSlot,
              endTime: `${String(Number(recurringForm.timeSlot.split(':')[0]) + 1).padStart(2, '0')}:00`,
              serviceType: recurringForm.serviceType,
              specialistId: recurringForm.specialistId,
              maxCapacity: maxCap,
            }),
          }).then((res) => res.json()).then(async (newSession) => {
            if (newSession?.id) {
              await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: newSession.id,
                  clientId: recurringForm.clientId,
                }),
              });
            }
          });

          bookingPromises.push(promise);
        }
      }

      await Promise.all(bookingPromises);
      setShowRecurringModal(false);
      loadData();
      alert(`Successfully booked recurring weekday schedule for client!`);
    } catch (err) {
      alert('Error creating recurring booking');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Weekly Clinical Schedule & Sessions"
        subtitle="Monday to Friday weekday clinical operations with 2x/week (Mon/Wed) & multi-session booking (weekends excluded)"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Week Navigator & Action Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevWeek}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Clinical Week</span>
              <h2 className="text-base font-extrabold text-slate-900">
                {weekdays[0]?.dayNum} {weekdays[0]?.monthName} — {weekdays[4]?.dayNum} {weekdays[4]?.monthName} (Weekdays Mon–Fri)
              </h2>
            </div>

            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition"
              title="Next Week"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRecurringModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Repeat className="w-4 h-4" />
              + Book 2x/Week Schedule (Mon/Wed)
            </button>

            <button
              onClick={() => {
                setSlotForm({
                  title: '',
                  startTime: '08:00',
                  endTime: '09:00',
                  serviceType: 'SEMI_PRIVATE',
                  specialistId: specialists[0]?.id || '',
                  maxCapacity: 4,
                });
                setShowAddSlotModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              + Add Session Slot
            </button>
          </div>
        </div>

        {/* Weekday Selector Bar (Mon-Fri, Excludes Weekend) */}
        <div className="grid grid-cols-5 gap-3">
          {weekdays.map((day, idx) => {
            const isSelected = selectedWeekdayIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedWeekdayIndex(idx)}
                className={`p-4 rounded-2xl text-center border transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span className={`text-[11px] font-black uppercase tracking-wider block ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {day.shortName}
                </span>
                <div className="text-2xl font-black mt-1">
                  {day.dayNum}
                </div>
                <span className={`text-[10px] font-medium block mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {day.dayName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sessions for Selected Weekday */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {weekdays[selectedWeekdayIndex]?.dayName} Schedule — {formatDate(selectedDateStr)}
              </h3>
              <p className="text-xs text-slate-400">
                Clinical sessions, attending clients, and live slot capacity
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {sessions.length} Slots Scheduled
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading Schedule...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-700">No sessions scheduled for this day yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Click <strong>+ Add Session Slot</strong> or <strong>+ Book 2x/Week Schedule</strong> to populate slots.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => {
                const bookedCount = session.bookings?.length || 0;
                const maxCap = session.maxCapacity || (session.serviceType === 'PREMIUM' ? 1 : 4);
                const isFull = bookedCount >= maxCap;

                return (
                  <div
                    key={session.id}
                    className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold mb-1 ${
                          session.serviceType === 'PREMIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {session.serviceType === 'PREMIUM' ? 'Private 1:1' : 'Semi-Private 1:4'}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm">{session.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                        {session.startTime}
                      </span>
                    </div>

                    {/* Specialist */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      <span>{session.specialist?.name || 'Assigned Specialist'}</span>
                    </div>

                    {/* Capacity Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="text-slate-500">Capacity:</span>
                        <span className={isFull ? 'text-rose-600 font-black' : 'text-emerald-600'}>
                          {bookedCount} / {maxCap} {isFull && '(FULL)'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (bookedCount / maxCap) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Attending Clients */}
                    {session.bookings && session.bookings.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Enrolled Clients:
                        </span>
                        {session.bookings.map((b: any) => (
                          <div key={b.id} className="flex items-center justify-between text-xs font-semibold text-slate-800">
                            <span>• {b.client?.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({b.client?.clientId})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2">
                      {!isFull ? (
                        <button
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            setEnrollForm({ clientId: clients[0]?.id || '' });
                            setShowEnrollModal(true);
                          }}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Enroll Client in Slot
                        </button>
                      ) : (
                        <div className="text-center py-2 text-xs font-bold text-slate-400 bg-slate-100 rounded-xl">
                          Slot Full
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal: Book 2x/Week Recurring Schedule (Mon/Wed) */}
        {showRecurringModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Multi-Session Weekday Booking</h3>
                    <p className="text-xs text-slate-400">Covers Monday to Friday weekdays (weekends excluded)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecurringModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecurringBooking} className="mt-4 space-y-4">
                {/* Select Client */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Client *
                  </label>
                  <select
                    value={recurringForm.clientId}
                    onChange={(e) => setRecurringForm({ ...recurringForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    required
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.clientId}) — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Frequency Order */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Weekly Schedule Order
                  </label>
                  <select
                    value={recurringForm.frequency}
                    onChange={(e) => setRecurringForm({ ...recurringForm, frequency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    <option value="2X_WEEK">2 Times a Week — Monday & Wednesday (Recommended)</option>
                    <option value="3X_WEEK">3 Times a Week — Monday, Wednesday, Friday</option>
                    <option value="5X_WEEK">5 Times a Week — Monday through Friday (All Weekdays)</option>
                  </select>
                </div>

                {/* Service Type & Time Slot */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Session Type
                    </label>
                    <select
                      value={recurringForm.serviceType}
                      onChange={(e) => setRecurringForm({ ...recurringForm, serviceType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="SEMI_PRIVATE">Semi-Private 1:4</option>
                      <option value="PREMIUM">Private 1:1</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={recurringForm.timeSlot}
                      onChange={(e) => setRecurringForm({ ...recurringForm, timeSlot: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="07:00">07:00 AM</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="04:00">04:00 PM</option>
                      <option value="05:00">05:00 PM</option>
                      <option value="06:00">06:00 PM</option>
                      <option value="07:00">07:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Specialist */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Specialist
                  </label>
                  <select
                    value={recurringForm.specialistId}
                    onChange={(e) => setRecurringForm({ ...recurringForm, specialistId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  >
                    {specialists.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecurringModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition"
                  >
                    Generate Weekday Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Enroll Single Client */}
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Enroll Client into Slot</h3>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEnrollClient} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Client *
                  </label>
                  <select
                    value={enrollForm.clientId}
                    onChange={(e) => setEnrollForm({ clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.clientId}) — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEnrollModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Session Slot */}
        {showAddSlotModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Add Clinical Session Slot</h3>
                <button
                  onClick={() => setShowAddSlotModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSlot} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Slot Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Spine Stabilization"
                    value={slotForm.title}
                    onChange={(e) => setSlotForm({ ...slotForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Service Type
                    </label>
                    <select
                      value={slotForm.serviceType}
                      onChange={(e) => setSlotForm({ ...slotForm, serviceType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="SEMI_PRIVATE">Semi-Private 1:4</option>
                      <option value="PREMIUM">Private 1:1</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Specialist
                    </label>
                    <select
                      value={slotForm.specialistId}
                      onChange={(e) => setSlotForm({ ...slotForm, specialistId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      {specialists.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSlotModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                  >
                    Create Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
