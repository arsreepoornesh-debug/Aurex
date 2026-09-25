'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { 
  AlertTriangle, 
  UserX, 
  Phone, 
  MessageSquare, 
  Plus, 
  ArrowRight, 
  UserCheck,
  Settings,
  Sliders,
  ChevronRight,
  Clock
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function IrregularClientsPage() {
  const [irregularClients, setIrregularClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [irregularThreshold, setIrregularThreshold] = useState(7);
  const [inactiveThreshold, setInactiveThreshold] = useState(30);

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
        {/* Settings & Alert Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Attendance Drop-off Detection</h2>
              <p className="text-xs text-slate-500">
                Identify clients missing consecutive sessions to initiate retention follow-ups.
              </p>
            </div>
          </div>

          {/* Configurable Thresholds */}
          <div className="flex items-center gap-3 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-slate-500" /> Thresholds:
            </span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Irregular:</span>
              <input
                type="number"
                value={irregularThreshold}
                onChange={(e) => setIrregularThreshold(Number(e.target.value))}
                className="w-12 px-1.5 py-0.5 border border-slate-300 rounded text-center font-bold text-slate-800"
              />
              <span className="text-slate-500">days</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Inactive:</span>
              <input
                type="number"
                value={inactiveThreshold}
                onChange={(e) => setInactiveThreshold(Number(e.target.value))}
                className="w-12 px-1.5 py-0.5 border border-slate-300 rounded text-center font-bold text-slate-800"
              />
              <span className="text-slate-500">days</span>
            </div>
          </div>
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
                className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-amber-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{client.name}</h3>
                      <p className="text-[11px] font-mono text-slate-500">{client.clientId}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Irregular
                    </span>
                  </div>

                  <div className="py-2 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Phone:</span>
                      <span className="font-mono font-bold text-slate-800">{client.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Attended:</span>
                      <span className="font-semibold text-slate-800">
                        {client.lastAttendedDate ? formatDate(client.lastAttendedDate) : 'No attendance in 7+ days'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Specialist:</span>
                      <span className="font-semibold text-emerald-700">
                        {client.assignedSpecialist?.name || 'Dr. Raghav Mehta'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold text-center transition"
                  >
                    View History
                  </Link>

                  <a
                    href={`https://wa.me/91${client.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#25D366] text-white hover:bg-emerald-600 transition"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`tel:${client.phone}`}
                    className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
