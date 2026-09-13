'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { AlertTriangle, UserX, Phone, MessageSquare, Plus, ArrowRight, UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function IrregularClientsPage() {
  const [irregularClients, setIrregularClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchIrregular() {
    setLoading(true);
    try {
      const res = await fetch('/api/quick-manage');
      const data = await res.json();
      setIrregularClients(data.irregularClients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIrregular();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header title="Irregular Clients" subtitle="Quick Manage — Clients with Inconsistent Attendance & Drop-off Risk" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-5">
        {/* Header Alert Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">Inconsistent Attendance Retention Alert</h2>
              <p className="text-xs text-amber-800">
                Clients who have missed 2+ consecutive sessions or haven't attended recently. Early outreach protects clinical outcomes.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full">
            {irregularClients.length} Flagged
          </span>
        </div>

        {/* Clients Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading irregular clients...</div>
        ) : irregularClients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
            <UserCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">All clients have regular attendance!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">No attendance drop-off flags detected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {irregularClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-amber-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{client.name}</h3>
                      <p className="text-[11px] font-mono text-slate-500">{client.clientId}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      {client.missedCount} Missed Session{client.missedCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Phone:</span>
                      <span className="font-mono font-bold text-slate-800">{client.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Last Attended:</span>
                      <span className="font-semibold text-slate-800">
                        {client.lastAttendedDate ? formatDate(client.lastAttendedDate) : 'No attendance yet'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Assigned Specialist:</span>
                      <span className="font-semibold text-emerald-700">
                        {client.assignedSpecialist?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <a
                    href={`tel:${client.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Client</span>
                  </a>

                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <span>Inspect Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
