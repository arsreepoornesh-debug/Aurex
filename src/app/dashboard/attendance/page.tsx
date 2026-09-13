'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Calendar, 
  Search, 
  UserCheck, 
  UserX, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  BarChart2,
  Activity,
  Check
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

const HOURS = [
  '12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM',
  '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM',
  '8PM', '9PM', '10PM'
];

export default function AttendancePage() {
  const [fromDate, setFromDate] = useState('2026-09-13');
  const [toDate, setToDate] = useState('2026-09-13');
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch(`/api/sessions?date=${fromDate}`),
        fetch('/api/clients'),
      ]);
      const sData = await sRes.json();
      const cData = await cRes.json();
      setSessions(Array.isArray(sData) ? sData : []);
      setClients(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [fromDate]);

  async function handleMarkAttendance(sessionId: string, clientId: string, status: string) {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, clientId, status }),
      });

      if (res.ok) {
        setActionSuccess(`Marked ${status}`);
        setTimeout(() => setActionSuccess(''), 3000);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Calculate heatmap data
  const heatmapData = [
    { date: '13/09/2026 (Sun)', counts: [0, 0, 0, 0, 0, 0, 1, 2, 4, 3, 2, 1, 0, 0, 0, 2, 3, 4, 4, 3, 1, 0, 0] },
    { date: '12/09/2026 (Sat)', counts: [0, 0, 0, 0, 0, 0, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 3, 4, 3, 2, 1, 0, 0] },
    { date: '11/09/2026 (Fri)', counts: [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 2, 1, 0, 0, 0, 2, 4, 4, 3, 2, 0, 0, 0] },
    { date: '10/09/2026 (Thu)', counts: [0, 0, 0, 0, 0, 0, 2, 3, 4, 3, 1, 1, 0, 0, 0, 1, 3, 4, 4, 2, 1, 0, 0] },
  ];

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Search Bar */}
      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <select className="bg-slate-100 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 font-bold outline-none">
          <option value="ALL">All Clients</option>
          <option value="SEMI_PRIVATE">Semi-Private Batches</option>
          <option value="PREMIUM">Premium 1:1</option>
        </select>
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search for Client, Name, Contact No., Email, Student ID/Biometric ID 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Filter Row (Dark Navy #1e3a8a) */}
      <div className="bg-[#1e3a8a] text-white p-3 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 items-center text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 shrink-0">Show</span>
            <select className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none">
              <option value={10} className="text-slate-900">10</option>
              <option value={25} className="text-slate-900">25</option>
              <option value={50} className="text-slate-900">50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-300 text-[11px]">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-300 text-[11px]">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none truncate"
            >
              <option value="ALL" className="text-slate-900">—All Clients—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-900">
                  {c.name} ({c.clientId})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={loadData}
              className="w-full bg-[#3b82f6] hover:bg-blue-600 px-3 py-1 rounded text-white text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Chart Section */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            Attendance Trend (No. of Clients vs Date/Time)
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Date Range: {fromDate} to {toDate}</span>
        </div>

        {/* CSS Bar Chart Simulation */}
        <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-4 bg-slate-50 rounded-lg border border-slate-100">
          {[
            { label: '06:00 AM', count: 2, height: '40%' },
            { label: '07:00 AM', count: 3, height: '60%' },
            { label: '08:00 AM', count: 4, height: '90%' },
            { label: '09:00 AM', count: 4, height: '90%' },
            { label: '10:00 AM', count: 2, height: '45%' },
            { label: '04:00 PM', count: 3, height: '65%' },
            { label: '05:00 PM', count: 4, height: '95%' },
            { label: '06:00 PM', count: 4, height: '95%' },
            { label: '07:00 PM', count: 2, height: '50%' },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition">
                {bar.count}
              </span>
              <div
                style={{ height: bar.height }}
                className="w-full max-w-[36px] bg-gradient-to-t from-[#1e40af] to-emerald-500 rounded-t hover:brightness-110 transition shadow-sm"
              />
              <span className="text-[9px] font-semibold text-slate-500 whitespace-nowrap">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Heatmap (Full Width Grid 12 AM to 10 PM) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Attendance & Session Slot Utilisation Heatmap
          </span>
          <span className="text-[11px] text-slate-400">Hour-by-hour client density</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold">
                <th className="py-2 px-3 text-left w-32 border border-slate-200">Date</th>
                {HOURS.map((hr) => (
                  <th key={hr} className="py-2 px-1 border border-slate-200 min-w-[34px]">
                    {hr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 text-left font-bold text-slate-800 bg-slate-50 border border-slate-200 whitespace-nowrap">
                    {row.date}
                  </td>
                  {row.counts.map((cnt, hIdx) => {
                    let bg = 'bg-slate-50 text-slate-300';
                    if (cnt === 1) bg = 'bg-emerald-100 text-emerald-800 font-bold';
                    if (cnt === 2) bg = 'bg-emerald-200 text-emerald-900 font-bold';
                    if (cnt === 3) bg = 'bg-emerald-400 text-white font-bold';
                    if (cnt >= 4) bg = 'bg-emerald-600 text-white font-black';

                    return (
                      <td key={hIdx} className={`py-2 px-1 border border-slate-200 ${bg} transition-colors`}>
                        {cnt > 0 ? cnt : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500 pt-2 italic">
          Note: Explore attendance trends at a glance: darker shades reveal busier time periods, while lighter tones indicate fewer attendees.
        </p>
      </div>

      {/* Live Roster for Selected Day */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            Live Session Attendance Roster for {formatDate(fromDate)}
          </span>
          {actionSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {actionSuccess}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No session slots on this date.</div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900">
                      {s.startTime} – {s.endTime} ({s.serviceType.replace('_', ' ')})
                    </span>
                    <span className="text-slate-500 text-[11px] ml-2 font-medium">
                      Specialist: <span className="text-slate-800 font-semibold">{s.specialist.name}</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {s.bookings.length}/{s.maxCapacity} Enrolled
                  </span>
                </div>

                {s.bookings.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No bookings in this slot.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {s.bookings.map((b: any) => {
                      const att = s.attendances?.find((a: any) => a.clientId === b.clientId);
                      const status = att?.status || 'PENDING';

                      return (
                        <div key={b.id} className="bg-white p-2.5 rounded border border-slate-200 flex flex-col justify-between gap-2 shadow-xs">
                          <div>
                            <Link
                              href={`/dashboard/clients/${b.clientId}`}
                              className="font-bold text-xs text-[#3b82f6] hover:underline block truncate"
                            >
                              {b.client.name}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono">{b.client.clientId}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMarkAttendance(s.id, b.clientId, 'PRESENT')}
                              className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                                status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(s.id, b.clientId, 'ABSENT')}
                              className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                                status === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(s.id, b.clientId, 'NO_SHOW')}
                              className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                                status === 'NO_SHOW'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              No-Show
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
