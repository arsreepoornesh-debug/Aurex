'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Package as PackageIcon,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Clock,
  Activity,
  X,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { canManageMasterPackages } from '@/lib/rbac';

export default function PackagesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';
  const canEdit = canManageMasterPackages(userRole);

  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    serviceType: 'SEMI_PRIVATE',
    sessionCount: 12,
    price: 24000,
    validityDays: 60,
  });

  async function loadPackages() {
    setLoading(true);
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackages();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        setForm({
          name: '',
          serviceType: 'SEMI_PRIVATE',
          sessionCount: 12,
          price: 24000,
          validityDays: 60,
        });
        loadPackages();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create package');
      }
    } catch (err) {
      alert('Error creating package');
    }
  }

  return (
    <div>
      <Header
        title="Package Management & Catalog"
        subtitle="Manage master clinical session packages, pricing tiers, and validity"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Action */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Create and configure dynamic clinical packages without code changes.
          </p>

          {canEdit ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Package</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Pricing Management Restricted to Owner / Manager</span>
            </div>
          )}
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="clinical-card p-6 flex flex-col justify-between border-[#26354D] hover:border-emerald-500/40 transition"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        pkg.serviceType === 'SEMI_PRIVATE'
                          ? 'badge-semi-private'
                          : pkg.serviceType === 'PREMIUM'
                          ? 'badge-premium'
                          : 'badge-assessment'
                      }`}
                    >
                      {pkg.serviceType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      {pkg.sessionCount} Sessions
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white mt-1">{pkg.name}</h3>

                  <div className="mt-4 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Validity Duration:</span>
                      <span className="text-slate-200 font-bold">{pkg.validityDays} Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Subscriptions:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {pkg._count?.clientPackages || 0} Clients
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Base Price</span>
                    <span className="text-lg font-black text-white font-mono">
                      {canEdit ? formatCurrency(pkg.price) : '•••••• (Protected)'}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Package */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clinical-card w-full max-w-md p-6 border-[#384F73] bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-emerald-400" />
                Create New Master Package
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semi-Private 36 Sessions"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Service Type
                </label>
                <select
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="SEMI_PRIVATE">Semi-Private (Max 4)</option>
                  <option value="PREMIUM">Premium 1:1 (Max 1)</option>
                  <option value="ASSESSMENT">Assessment (1:1)</option>
                  <option value="CONSULTATION">Consultation (1:1)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Session Count *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.sessionCount}
                    onChange={(e) => setForm({ ...form, sessionCount: Number(e.target.value) })}
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Validity (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.validityDays}
                    onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })}
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Base Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
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
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
