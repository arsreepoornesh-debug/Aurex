'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, 
  Search, 
  FileSpreadsheet, 
  Mail, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Clock,
  PlusCircle,
  X,
  Check
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function RenewalsPage() {
  const [data, setData] = useState<any>(null);
  const [masterPackages, setMasterPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLimit, setShowLimit] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedRenewals, setSelectedRenewals] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  const [renewForm, setRenewForm] = useState({
    packageId: '',
    name: '',
    totalSessions: 12,
    pricePaid: 24000,
    validityDays: 60,
  });

  async function loadData() {
    setLoading(true);
    try {
      const [dRes, pRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/packages'),
      ]);

      const dData = await dRes.json();
      const pData = await pRes.json();

      setData(dData?.alerts || {});
      setMasterPackages(Array.isArray(pData) ? pData : []);

      if (pData.length > 0) {
        setRenewForm({
          packageId: pData[0].id,
          name: pData[0].name,
          totalSessions: pData[0].sessionCount,
          pricePaid: pData[0].price,
          validityDays: pData[0].validityDays,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      const res = await fetch(`/api/clients/${selectedClient.id}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renewForm),
      });

      if (res.ok) {
        setShowRenewModal(false);
        setSelectedClient(null);
        loadData();
        alert('Package renewed successfully!');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to renew package');
      }
    } catch (err) {
      alert('Error renewing package');
    }
  };

  // Combine low sessions + expiring packages
  const allRenewalPackages: any[] = [];
  const seenIds = new Set<string>();

  (data?.lowSessionPackages || []).forEach((p: any) => {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      allRenewalPackages.push({ ...p, reason: 'Low Sessions (≤ 2)' });
    }
  });

  (data?.expiringPackages || []).forEach((p: any) => {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      allRenewalPackages.push({ ...p, reason: 'Expiring ≤ 7 Days' });
    }
  });

  // Filter
  const filteredPackages = allRenewalPackages.filter((p) => {
    const clientName = p.client?.name || '';
    const matchesSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client?.phone && p.client.phone.includes(searchTerm));
    const matchesCategory =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'LOW_SESSIONS' && p.sessionsRemaining <= 2) ||
      (categoryFilter === 'EXPIRING' && p.reason.includes('Expiring'));
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPackages.length / showLimit) || 1;
  const paginatedPackages = filteredPackages.slice((currentPage - 1) * showLimit, currentPage * showLimit);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRenewals(filteredPackages.map((p) => p.id));
    } else {
      setSelectedRenewals([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedRenewals.includes(id)) {
      setSelectedRenewals(selectedRenewals.filter((i) => i !== id));
    } else {
      setSelectedRenewals([...selectedRenewals, id]);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Upcoming Renewals & Expiry</h1>
          <p className="text-xs text-slate-500">Clients requiring package renewals (low sessions or expiring ≤ 7 days)</p>
        </div>
      </div>

      {/* 1. FILTER BAR (Dark Navy #1e3a8a) */}
      <div className="bg-[#1e3a8a] text-white p-3 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 items-center text-xs">
          {/* Show limit */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 shrink-0">Show</span>
            <select
              value={showLimit}
              onChange={(e) => {
                setShowLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value={5} className="text-slate-900">5</option>
              <option value={10} className="text-slate-900">10</option>
              <option value={25} className="text-slate-900">25</option>
              <option value={50} className="text-slate-900">50</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">—All Renewal Types—</option>
              <option value="LOW_SESSIONS" className="text-slate-900">Low Sessions (≤ 2 Left)</option>
              <option value="EXPIRING" className="text-slate-900">Expiring ≤ 7 Days</option>
            </select>
          </div>

          {/* Search */}
          <div className="lg:col-span-3 relative">
            <input
              type="text"
              placeholder="Search Client Name, Contact, Package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded pl-7 pr-2.5 py-1 text-white placeholder-slate-300 text-xs outline-none focus:bg-white/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-2 top-1.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. BULK BUTTONS & EXPORT */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Broadcasting Renewal Reminder SMS`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📢 BULK SMS</span>
          </button>

          <button
            onClick={() => alert(`Broadcasting WhatsApp Renewal reminders`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📱 BULK WHATSAPP</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button
            onClick={() => alert(`Sending Renewal Outreach Emails`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0f766e] hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>✉ BULK EMAIL</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Renewals list to Excel...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel export</span>
          </button>
        </div>
      </div>

      {/* 3. TABLE WITH BLUE HEADER (#1e40af) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1e40af] text-white font-bold uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedRenewals.length === filteredPackages.length && filteredPackages.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-10"># ↕</th>
                <th className="py-2.5 px-3">Date / Expiry ↕</th>
                <th className="py-2.5 px-3">Name ↕</th>
                <th className="py-2.5 px-3">Contact No.</th>
                <th className="py-2.5 px-2 text-center">Photo</th>
                <th className="py-2.5 px-3">Remaining Sessions</th>
                <th className="py-2.5 px-3">For (Package)</th>
                <th className="py-2.5 px-3">Rep.</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Loading upcoming renewals...
                  </td>
                </tr>
              ) : paginatedPackages.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No clients currently requiring renewal.
                  </td>
                </tr>
              ) : (
                paginatedPackages.map((pkg, idx) => {
                  const globalIdx = (currentPage - 1) * showLimit + idx + 1;
                  const isSelected = selectedRenewals.includes(pkg.id);
                  const client = pkg.client || {};
                  const expiryDateStr = formatDate(pkg.expiryDate);

                  return (
                    <tr
                      key={pkg.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(pkg.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-500 font-semibold">{globalIdx}</td>
                      <td className="py-3 px-3 text-amber-700 font-bold whitespace-nowrap">{expiryDateStr}</td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="font-bold text-[#3b82f6] hover:underline"
                        >
                          {client.name}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono block">{client.clientId}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{client.phone}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center mx-auto text-xs">
                          {(client.name || 'C')[0]}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-600">
                        {pkg.sessionsRemaining} / {pkg.totalSessions} Left
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{pkg.name}</span>
                        <span className="text-[10px] text-rose-700 font-bold block">{pkg.reason}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">Admin</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Renew Button */}
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowRenewModal(true);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Renew</span>
                          </button>

                          {/* WhatsApp */}
                          {client.phone && (
                            <a
                              href={`https://wa.me/91${client.phone.replace(/\D/g, '')}?text=Dear%20${encodeURIComponent(
                                client.name
                              )},%20your%20AUREX%20package%20(${encodeURIComponent(
                                pkg.name
                              )})%20is%20ready%20for%20renewal.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition shadow-sm"
                              title="Send WhatsApp renewal reminder"
                            >
                              <span className="text-[10px] font-bold">📱</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. FOOTER & PAGINATION */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * showLimit + (filteredPackages.length ? 1 : 0)}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(currentPage * showLimit, filteredPackages.length)}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredPackages.length}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded text-xs font-bold transition ${
                  currentPage === p
                    ? 'bg-[#1e40af] text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Instant Package Renewal */}
      {showRenewModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                Renew Package for {selectedClient.name}
              </span>
              <button onClick={() => setShowRenewModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Renewal Package</label>
                <select
                  value={renewForm.packageId}
                  onChange={(e) => {
                    const selected = masterPackages.find((p) => p.id === e.target.value);
                    if (selected) {
                      setRenewForm({
                        packageId: selected.id,
                        name: selected.name,
                        totalSessions: selected.sessionCount,
                        pricePaid: selected.price,
                        validityDays: selected.validityDays,
                      });
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-medium"
                >
                  {masterPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sessionCount} sessions · ₹{p.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Sessions</label>
                  <input
                    type="number"
                    value={renewForm.totalSessions}
                    onChange={(e) => setRenewForm({ ...renewForm, totalSessions: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={renewForm.validityDays}
                    onChange={(e) => setRenewForm({ ...renewForm, validityDays: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
