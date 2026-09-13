'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Award, Star, Phone, MessageSquare, Calendar, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AnniversariesPage() {
  const [anniversaryClients, setAnniversaryClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAnniversaries() {
    setLoading(true);
    try {
      const res = await fetch('/api/quick-manage');
      const data = await res.json();
      setAnniversaryClients(data.anniversaryClients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnniversaries();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header title="Membership Anniversary" subtitle="Quick Manage — Client Membership Milestones" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-5">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">Membership Anniversary Milestones</h2>
              <p className="text-xs text-amber-800">
                Recognize long-term loyalty and celebrate client transformation milestones.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full">
            {anniversaryClients.length} Milestones
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading anniversaries...</div>
        ) : anniversaryClients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
            <Star className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">No client anniversaries this week</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Membership anniversary milestones will be highlighted as dates approach.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anniversaryClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-amber-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{client.name}</h3>
                        <p className="text-[11px] font-mono text-slate-500">{client.clientId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-600" /> {client.yearsCompleted} Year{client.yearsCompleted > 1 ? 's' : ''} with AUREX
                    </span>
                  </div>

                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Joined Date:</span>
                      <span className="font-bold text-slate-800">{formatDate(client.registrationDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Phone:</span>
                      <span className="font-mono font-semibold text-slate-800">{client.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <a
                    href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=Congratulations%20on%20your%20membership%20anniversary%20with%20AUREX!`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1 border border-emerald-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Send Greetings</span>
                  </a>

                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    View 360°
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
