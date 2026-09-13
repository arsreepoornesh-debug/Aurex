'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, PlusCircle, Search, Sparkles, Check, X, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function SemiPrivatePackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: 'Semi-Private 12-Session Pack',
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
      const all = Array.isArray(data) ? data : [];
      setPackages(all.filter((p: any) => p.serviceType === 'SEMI_PRIVATE'));
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
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Semi-Private Packages (Catalog)</h1>
          <p className="text-xs text-slate-500">Master price book for 4:1 semi-private clinical exercise sessions</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Package</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1e40af] text-white font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Package Name</th>
                <th className="py-2.5 px-3">Capacity</th>
                <th className="py-2.5 px-3">Sessions</th>
                <th className="py-2.5 px-3">Master Price</th>
                <th className="py-2.5 px-3">Validity</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">Loading catalog...</td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">No Semi-Private packages defined.</td>
                </tr>
              ) : (
                packages.map((pkg, idx) => (
                  <tr key={pkg.id} className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      {pkg.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">Max 4 Clients (Semi-Private)</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{pkg.sessionCount} Sessions</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">{formatCurrency(pkg.price)}</td>
                    <td className="py-3 px-3 text-slate-600">{pkg.validityDays} Days</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                Add Semi-Private Package
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow transition"
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
