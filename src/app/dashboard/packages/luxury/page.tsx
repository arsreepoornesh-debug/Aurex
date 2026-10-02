'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, PlusCircle, X, Users, Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Header } from '@/components/layout/Header';

export default function LuxuryPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: 'Luxury Concierge Rehab & Wellness (12 Sessions)',
    serviceType: 'LUXURY',
    sessionCount: 12,
    price: 46000,
    validityDays: 60,
  });

  async function loadPackages() {
    setLoading(true);
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      const allPkgs = data.packages || (Array.isArray(data) ? data : []);
      const allClientPkgs = data.clientPackages || [];
      setPackages(allPkgs.filter((p: any) => p.serviceType === 'LUXURY'));
      setClientPackages(allClientPkgs.filter((cp: any) => cp.serviceType === 'LUXURY'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackages();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAddModal(false);
        loadPackages();
      } else {
        alert('Failed to create package');
      }
    } catch (err) {
      alert('Error creating package');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Luxury Concierge Packages"
        subtitle="Master price book and active clients for Luxury Concierge Rehabilitation (₹46,000 / 12 Sessions)"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-rose-600" />
              Master Catalog – Luxury Concierge (₹46,000)
            </h2>
            <p className="text-xs text-slate-500">Premium concierge wellness, recovery & VIP active rehab</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Package Tier</span>
          </button>
        </div>

        {/* Catalog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.length === 0 ? (
            <div className="col-span-3 py-8 text-center text-slate-400 text-xs font-medium bg-white rounded-2xl border border-dashed border-slate-200">
              No luxury packages defined. Click + Add Package Tier to create one.
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="p-5 rounded-2xl border border-rose-200 bg-white shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">{pkg.name}</h4>
                  <span className="text-xs font-mono font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    {formatCurrency(pkg.price)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 font-medium">
                  <span>{pkg.sessionCount} Sessions</span>
                  <span>•</span>
                  <span>{pkg.validityDays} Days Validity</span>
                  <span>•</span>
                  <span className="text-rose-600 font-bold">Luxury Concierge</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Enrolled Clients in Luxury */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-rose-50/40 border-b border-rose-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-rose-950">Active Clients Enrolled in Luxury Concierge</h3>
              <p className="text-xs text-rose-700">Track remaining sessions and due amounts</p>
            </div>
            <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
              {clientPackages.length} Clients
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4 text-center">Sessions Left</th>
                  <th className="py-3 px-4 text-right">Package Amount</th>
                  <th className="py-3 px-4 text-right">Due Balance</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientPackages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No clients currently enrolled in Luxury Concierge.
                    </td>
                  </tr>
                ) : (
                  clientPackages.map((cp) => (
                    <tr key={cp.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link href={`/dashboard/clients/${cp.clientId}`} className="hover:text-rose-600 transition">
                          {cp.client?.name}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono block">{cp.client?.clientId}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{cp.name}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {cp.sessionsRemaining} / {cp.totalSessions}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-700">{formatCurrency(cp.packageAmount || 46000)}</td>
                      <td className="py-3.5 px-4 text-right font-bold">
                        {cp.balanceRemaining > 0 ? (
                          <span className="text-rose-600 font-black">{formatCurrency(cp.balanceRemaining)}</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">₹0 (Paid)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{formatDate(cp.expiryDate)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/dashboard/payments`}
                          className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
                        >
                          View Billing
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Crown className="w-4 h-4 text-rose-600" />
                Add Luxury Concierge Package
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session Count</label>
                  <input
                    type="number"
                    required
                    value={form.sessionCount}
                    onChange={(e) => setForm({ ...form, sessionCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-none font-bold text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Validity (Days)</label>
                <input
                  type="number"
                  required
                  value={form.validityDays}
                  onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
