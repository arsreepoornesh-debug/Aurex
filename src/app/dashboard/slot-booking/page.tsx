'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Search,
  Users,
  Crown,
  Star,
  Layers,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  ArrowUpDown,
  Filter,
  UserCheck
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';

const SLOTS_PER_CATEGORY: Record<string, number> = { PREMIUM: 1, SEMI_PRIVATE: 4, LUXURY: 1 };

const CATEGORY_META: Record<string, { label: string; price: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  PREMIUM:     { label: 'Premium Slot',      price: '₹12,000', icon: <Star className="w-4 h-4" />,   color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  SEMI_PRIVATE:{ label: 'Semi-Private Slot', price: '₹12,000', icon: <Layers className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-200' },
  LUXURY:      { label: 'Luxury Slot',       price: '₹46,000', icon: <Crown className="w-4 h-4" />,  color: 'text-rose-600',   bg: 'bg-rose-50',    border: 'border-rose-200' },
};

function SlotBookingContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') || 'SEMI_PRIVATE') as string;
  const preSelectedClient = searchParams.get('client') || '';

  const [category, setCategory] = useState(initialCategory);
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'time' | 'capacity'>('time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [bookingClientId, setBookingClientId] = useState(preSelectedClient);
  const [bookingLoading, setBookingLoading] = useState(false);

  function showMsg(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [sessRes, cliRes] = await Promise.all([
        fetch(`/api/sessions?date=${selectedDate}&serviceType=${category}`),
        fetch('/api/clients'),
      ]);
      const sessData = await sessRes.json();
      const cliData = await cliRes.json();
      setSessions(Array.isArray(sessData) ? sessData : sessData.sessions || []);
      setClients(Array.isArray(cliData) ? cliData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [selectedDate, category]);

  const filteredSessions = sessions
    .filter((s) => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return (
        s.title?.toLowerCase().includes(q) ||
        s.startTime?.includes(q) ||
        s.specialist?.name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let va: any = '', vb: any = '';
      if (sortField === 'time') { va = a.startTime || ''; vb = b.startTime || ''; }
      else if (sortField === 'name') { va = a.title || ''; vb = b.title || ''; }
      else if (sortField === 'capacity') { va = a.currentCapacity || 0; vb = b.currentCapacity || 0; }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const maxSlots = SLOTS_PER_CATEGORY[category] || 4;
  const meta = CATEGORY_META[category];

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingClientId || !selectedSession) return;
    setBookingLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: selectedSession.id, clientId: bookingClientId }),
      });
      if (res.ok) {
        setShowBookingModal(false);
        loadData();
        showMsg('success', 'Slot booked successfully!');
      } else {
        const err = await res.json();
        showMsg('error', err.error || 'Failed to book slot');
      }
    } catch (err) {
      showMsg('error', 'Error booking slot');
    } finally {
      setBookingLoading(false);
    }
  };

  // Navigate dates
  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };
  const today = () => setSelectedDate(new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Slot Booking"
        subtitle="Book session slots by category — Premium, Semi-Private, and Luxury"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-xl ${notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-red-950/90 border-red-500/50 text-red-200'}`}>
            {notification.type === 'success' ? '✓' : '✗'} {notification.message}
          </div>
        )}

        {/* Category Selector */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(CATEGORY_META).map(([key, m]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                category === key
                  ? `${m.bg} ${m.border} ${m.color} shadow-md scale-[1.02]`
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {m.icon}
              {m.label}
              <span className={`text-xs font-mono ${category === key ? m.color : 'text-slate-400'}`}>{m.price}</span>
            </button>
          ))}
        </div>

        {/* Date Navigator + Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button onClick={prevDay} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-mono"
            />
            <button onClick={nextDay} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={today} className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">Today</button>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search sessions by title, time, specialist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none"
              />
            </div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${meta.bg} ${meta.border} border ${meta.color}`}>
            {meta.icon}
            <span>Max {maxSlots} per slot</span>
          </div>
        </div>

        {/* Slots Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading slots...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No {meta.label} slots found for this date.</p>
            <p className="text-slate-300 text-xs mt-1">Try a different date or add sessions from the Today's Schedule page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSessions.map((s) => {
              const used = s.currentCapacity || 0;
              const max = s.maxCapacity || maxSlots;
              const full = used >= max;
              const pct = Math.min(100, Math.round((used / max) * 100));

              return (
                <div
                  key={s.id}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${full ? 'border-rose-200' : 'border-slate-200 hover:border-emerald-300'}`}
                >
                  {/* Header */}
                  <div className={`px-4 py-3 border-b ${full ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{s.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{s.startTime} – {s.endTime}</div>
                      </div>
                      {full ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap">FULL</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">OPEN</span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    {/* Specialist */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{s.specialist?.name || 'Unassigned'}</span>
                    </div>

                    {/* Capacity Progress */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {used} / {max} Slots Used
                        </span>
                        <span className={full ? 'text-rose-600' : 'text-emerald-600'}>{max - used} Available</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Enrolled Clients mini-list */}
                    {s.bookings && s.bookings.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled</div>
                        {s.bookings.map((b: any) => (
                          <div key={b.id} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-2.5 py-1.5">
                            <span className="font-semibold text-slate-800">{b.client?.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{b.client?.clientId}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Book Slot Button */}
                    <button
                      disabled={full}
                      onClick={() => { setSelectedSession(s); setShowBookingModal(true); }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition ${full ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'}`}
                    >
                      {full ? 'Slot Full — No Availability' : `Book ${meta.label}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedSession && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Book {meta.label}</h3>
                  <p className="text-xs text-slate-400">{selectedSession.title} • {selectedSession.startTime}–{selectedSession.endTime} • {selectedDate}</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleBookSlot} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Client *</label>
                  <input
                    type="text"
                    placeholder="Search client..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium mb-2 focus:bg-white focus:outline-none"
                    onChange={(e) => {}}
                  />
                  <select
                    value={bookingClientId}
                    onChange={(e) => setBookingClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                    required
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.clientId})</option>
                    ))}
                  </select>
                </div>

                <div className={`p-3 rounded-xl text-xs border ${meta.bg} ${meta.border}`}>
                  <div className="font-bold text-slate-700 mb-1">Slot Summary</div>
                  <div className="text-slate-600 space-y-0.5">
                    <div>Category: <strong>{meta.label}</strong></div>
                    <div>Time: <strong>{selectedSession.startTime} – {selectedSession.endTime}</strong></div>
                    <div>Capacity: <strong>{selectedSession.currentCapacity}/{selectedSession.maxCapacity}</strong></div>
                    <div>Specialist: <strong>{selectedSession.specialist?.name || 'Unassigned'}</strong></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowBookingModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={bookingLoading} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md disabled:opacity-60">
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
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

export default function SlotBookingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading...</div>}>
      <SlotBookingContent />
    </Suspense>
  );
}
