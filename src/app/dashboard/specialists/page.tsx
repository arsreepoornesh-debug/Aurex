'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Stethoscope,
  PlusCircle,
  Phone,
  Mail,
  Users,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';

export default function SpecialistsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';
  const canEdit = userRole === 'OWNER' || userRole === 'MANAGER';

  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
    colorCode: '#10B981',
  });

  async function loadSpecialists() {
    setLoading(true);
    try {
      const res = await fetch('/api/specialists');
      const data = await res.json();
      setSpecialists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSpecialists();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/specialists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        setForm({
          name: '',
          email: '',
          phone: '',
          specialization: '',
          bio: '',
          colorCode: '#10B981',
        });
        loadSpecialists();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create specialist');
      }
    } catch (err) {
      alert('Error creating specialist');
    }
  }

  return (
    <div>
      <Header
        title="Specialists & Clinical Staff Roster"
        subtitle="Manage exercise physiologists, medical fitness specialists, and patient loads"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Specialists have strict clinical isolation (no access to clinic financial or revenue data).
          </p>

          {canEdit && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Specialist</span>
            </button>
          )}
        </div>

        {/* Specialists Grid */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {specialists.map((s) => (
              <div
                key={s.id}
                className="clinical-card p-6 flex flex-col justify-between border-[#26354D]"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                        style={{ backgroundColor: s.colorCode }}
                      >
                        {s.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">{s.name}</h3>
                        <p className="text-xs text-emerald-400 font-semibold">{s.specialization}</p>
                      </div>
                    </div>
                  </div>

                  {s.bio && <p className="text-xs text-slate-300 mt-2 line-clamp-3">{s.bio}</p>}

                  <div className="mt-4 space-y-2 text-xs text-slate-400 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.email}</span>
                    </div>
                    {s.phone && (
                      <div className="flex items-center gap-2 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[#0B1120] border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Clients</span>
                    <span className="font-bold text-white font-mono">{s._count?.clients || 0}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B1120] border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Sessions</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {s._count?.sessions || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B1120] border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Assessments</span>
                    <span className="font-bold text-blue-400 font-mono">
                      {s._count?.assessments || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Specialist */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clinical-card w-full max-w-md p-6 border-[#384F73] bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                Add Clinical Specialist
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name (with Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Raghav Mehta"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@aurex.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 ..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Specialization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical Exercise Physiologist & Spine Rehab"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Color Indicator
                  </label>
                  <input
                    type="color"
                    value={form.colorCode}
                    onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                    className="w-full h-9 bg-[#0B1120] border border-[#26354D] rounded-lg p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bio / Qualifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Credentials, clinical experience..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald"
                >
                  Save Specialist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
