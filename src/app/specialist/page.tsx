'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  Activity, 
  Plus, 
  ChevronRight, 
  UserCheck, 
  UserX, 
  HeartHandshake,
  Stethoscope,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';

export default function SpecialistDashboard() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<any[]>([]);
  const [assignedClients, setAssignedClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [noteContent, setNoteContent] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      // 1. Fetch sessions for today
      const todayStr = new Date().toISOString().split('T')[0];
      const sessRes = await fetch(`/api/bookings?date=${todayStr}`);
      if (sessRes.ok) {
        const data = await sessRes.json();
        setSessions(data);
      }

      // 2. Fetch assigned clients
      const cliRes = await fetch('/api/clients');
      if (cliRes.ok) {
        const allClients = await cliRes.json();
        // Dr Raghav Mehta's clients or all clients if admin
        const filtered = allClients.filter(
          (c: any) => c.assignedSpecialist?.name?.includes('Raghav') || c.clientId === 'AUR-2026-0001'
        );
        setAssignedClients(filtered.length > 0 ? filtered : allClients.slice(0, 4));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleMarkAttendance(sessionId: string, clientId: string, status: string) {
    setActionLoading(`${sessionId}-${clientId}`);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, clientId, status }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCompleteSession(sessionId: string) {
    if (!confirm('Complete this clinical session and automatically deduct 1 session for attending clients?')) return;
    setActionLoading(sessionId);
    try {
      const res = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        alert('✅ Session completed successfully. Session balances decremented atomically.');
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddClinicalNote(clientId: string) {
    if (!noteContent.trim()) return;
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteContent }),
      });
      if (res.ok) {
        alert('Clinical note logged.');
        setNoteContent('');
        setSelectedClient(null);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Clinical Station Live</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Dr. Raghav Mehta — Clinical Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your assigned clinical exercise sessions, attendances, and McGill Big 3 prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/assessments"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950"
            >
              <Plus className="w-4 h-4" />
              <span>New Assessment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Left: Today's Sessions | Right: Assigned Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Clinical Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Today's Scheduled Sessions
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {sessions.length} Slots Today
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-800 text-center text-slate-400 text-xs">
              No sessions scheduled for today.
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((sess) => {
                const isFull = (sess.bookings?.length || 0) >= sess.maxCapacity;
                const isCompleted = sess.status === 'COMPLETED';

                return (
                  <div
                    key={sess.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white font-mono text-xs font-bold">
                          {sess.startTime} – {sess.endTime}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white">{sess.title}</h3>
                          <span className="text-[11px] font-semibold text-emerald-400">
                            {sess.serviceType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            isFull
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {sess.bookings?.length || 0}/{sess.maxCapacity} {isFull && 'FULL'}
                        </span>

                        {isCompleted ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                            COMPLETED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCompleteSession(sess.id)}
                            disabled={actionLoading === sess.id}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                          >
                            {actionLoading === sess.id ? 'Completing...' : 'Complete Session'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Booked Clients in this Session */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Attending Clients ({sess.bookings?.length || 0}):
                      </p>

                      {sess.bookings?.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No clients booked in this slot yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {sess.bookings?.map((b: any) => {
                            const att = sess.attendances?.find((a: any) => a.clientId === b.clientId);
                            const currentStatus = att?.status || 'PENDING';

                            return (
                              <div
                                key={b.id}
                                className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-xs font-bold text-white block">
                                    {b.client?.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {b.client?.clientId}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleMarkAttendance(sess.id, b.clientId, 'PRESENT')}
                                    className={`p-1.5 rounded text-[10px] font-bold transition ${
                                      currentStatus === 'PRESENT'
                                        ? 'bg-emerald-500 text-white shadow'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                    title="Mark Present"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleMarkAttendance(sess.id, b.clientId, 'ABSENT')}
                                    className={`p-1.5 rounded text-[10px] font-bold transition ${
                                      currentStatus === 'ABSENT'
                                        ? 'bg-rose-500 text-white shadow'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                    title="Mark Absent"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Assigned Clients Clinical List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              My Assigned Clients
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            {assignedClients.map((client) => (
              <div
                key={client.id}
                className="p-3 rounded-xl bg-slate-850 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{client.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      {client.clientId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{client.phone}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
                    title="View 360° Clinical Profile"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Quick McGill Big 3 Reference Card */}
          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <HeartHandshake className="w-4 h-4" />
              McGill Big 3 Clinical Protocol
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <strong>1. Modified Curl-Up:</strong> Lumbar neutral, 10s holds.
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <strong>2. Side Bridge:</strong> Lateral core stability, glute medius.
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <strong>3. Bird-Dog:</strong> Contralateral limb extension, spinal stability.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
