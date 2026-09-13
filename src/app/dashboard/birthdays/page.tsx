'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Cake, Phone, MessageSquare, Gift, Heart, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function BirthdaysPage() {
  const [birthdayClients, setBirthdayClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBirthdays() {
    setLoading(true);
    try {
      const res = await fetch('/api/quick-manage');
      const data = await res.json();
      setBirthdayClients(data.birthdayClients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBirthdays();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header title="Client Birthdays" subtitle="Quick Manage — Birthdays Occurring This Week & Month" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-5">
        {/* Banner */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-700 flex items-center justify-center">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-pink-950">Client Birthday Celebrations</h2>
              <p className="text-xs text-pink-800">
                Send personalized clinical greetings and loyalty offers to celebrate client milestones.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-pink-900 bg-pink-200/80 px-3 py-1 rounded-full">
            {birthdayClients.length} Upcoming
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading birthdays...</div>
        ) : birthdayClients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
            <Gift className="w-10 h-10 text-pink-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">No client birthdays this week</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Birthday notifications will appear as upcoming dates approach.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {birthdayClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-pink-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{client.name}</h3>
                        <p className="text-[11px] font-mono text-slate-500">{client.clientId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Turning {client.age}
                    </span>
                  </div>

                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Date of Birth:</span>
                      <span className="font-bold text-slate-800">{formatDate(client.dob)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Phone:</span>
                      <span className="font-mono font-semibold text-slate-800">{client.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <a
                    href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=Happy%20Birthday%20from%20AUREX%20Clinical%20Fitness!`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1 border border-emerald-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Wish</span>
                  </a>

                  <a
                    href={`tel:${client.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Call</span>
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
