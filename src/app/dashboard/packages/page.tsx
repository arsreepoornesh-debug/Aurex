'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  PlusCircle,
  Activity,
  Clock,
  X,
  Layers,
  UserCheck,
  Calendar,
  UserPlus,
  Search,
  ArrowUpDown,
  Crown,
  Star
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { canManageMasterPackages } from '@/lib/rbac';

const CATEGORY_PRICING: Record<string, { price: number; label: string; sessions: number; validity: number }> = {
  PREMIUM:     { price: 12000, label: 'Premium 1:1 Slot',  sessions: 12, validity: 60 },
  SEMI_PRIVATE:{ price: 12000, label: 'Semi-Private 1:4',  sessions: 12, validity: 60 },
  LUXURY:      { price: 46000, label: 'Luxury Concierge',  sessions: 12, validity: 60 },
};

export default function PackagesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';
  const canEdit = canManageMasterPackages(userRole);

  const [packages, setPackages] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'PREMIUM' | 'SEMI_PRIVATE' | 'LUXURY'>('PREMIUM');
  const [enrolledSearch, setEnrolledSearch] = useState('');
  const [enrolledSort, setEnrolledSort] = useState<'name' | 'expiry' | 'sessions' | 'payment'>('name');
  const [enrolledSortDir, setEnrolledSortDir] = useState<'asc' | 'desc'>('asc');
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [packageForm, setPackageForm] = useState({ name: '', serviceType: 'PREMIUM', sessionCount: 12, price: 12000, validityDays: 60 });
  const [assignForm, setAssignForm] = useState({ clientId: '', packageId: '', name: '', serviceType: 'PREMIUM', totalSessions: 12, pricePaid: 12000, balanceRemaining: 0, validityDays: 60, startDate: new Date().toISOString().split('T')[0] });
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '', gender: 'Male', referralSource: 'Walk-in', assignedSpecialistId: '', category: 'PREMIUM', slotBookingDate: '', status: 'ACTIVE' });

  function showMsg(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [pkgRes, clientRes, specRes] = await Promise.all([fetch('/api/packages'), fetch('/api/clients'), fetch('/api/specialists')]);
      const pkgData = await pkgRes.json();
      const clData = await clientRes.json();
      const spData = await specRes.json();
      setPackages(pkgData.packages || []);
      setClientPackages(pkgData.clientPackages || []);
      setAllClients(Array.isArray(clData) ? clData : []);
      setSpecialists(Array.isArray(spData) ? spData : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const filteredMasterPackages = packages.filter((p) => p.serviceType === activeCategory);
  const enrolledBase = clientPackages.filter((cp) => cp.serviceType === activeCategory);
  const enrolledFiltered = enrolledBase.filter((cp) => {
    const q = enrolledSearch.toLowerCase();
    if (!q) return true;
    return cp.client?.name?.toLowerCase().includes(q) || cp.client?.clientId?.toLowerCase().includes(q) || cp.client?.phone?.includes(q) || cp.name?.toLowerCase().includes(q);
  });
  const enrolledSorted = [...enrolledFiltered].sort((a, b) => {
    let va: any = '', vb: any = '';
    if (enrolledSort === 'name') { va = a.client?.name || ''; vb = b.client?.name || ''; }
    else if (enrolledSort === 'expiry') { va = a.expiryDate || ''; vb = b.expiryDate || ''; }
    else if (enrolledSort === 'sessions') { va = a.sessionsRemaining; vb = b.sessionsRemaining; }
    else if (enrolledSort === 'payment') { va = a.balanceRemaining; vb = b.balanceRemaining; }
    if (typeof va === 'string') return enrolledSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    return enrolledSortDir === 'asc' ? va - vb : vb - va;
  });

  const premiumCount = clientPackages.filter((cp) => cp.serviceType === 'PREMIUM').length;
  const semiCount = clientPackages.filter((cp) => cp.serviceType === 'SEMI_PRIVATE').length;
  const luxCount = clientPackages.filter((cp) => cp.serviceType === 'LUXURY').length;

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(packageForm) });
    if (res.ok) { setShowCreatePackageModal(false); loadData(); showMsg('success', 'Package tier created!'); }
    else { const err = await res.json(); showMsg('error', err.error || 'Failed'); }
  };

  const handleAssignPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.clientId) { showMsg('error', 'Please select a client.'); return; }
    const res = await fetch('/api/packages/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(assignForm) });
    if (res.ok) { setShowAssignModal(false); loadData(); showMsg('success', 'Client enrolled!'); }
    else { const err = await res.json(); showMsg('error', err.error || 'Failed'); }
  };

  const handleRegisterNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newClientForm) });
    if (res.ok) {
      setShowNewClientModal(false);
      setNewClientForm({ name: '', phone: '', email: '', gender: 'Male', referralSource: 'Walk-in', assignedSpecialistId: '', category: activeCategory, slotBookingDate: '', status: 'ACTIVE' });
      loadData(); showMsg('success', 'Client registered!');
    } else { const err = await res.json(); showMsg('error', err.error || 'Failed'); }
  };

  const openAssignModal = (category: string) => {
    const pricing = CATEGORY_PRICING[category];
    const defaultPkg = packages.find((p) => p.serviceType === category);
    setAssignForm({ clientId: '', packageId: defaultPkg?.id || '', name: defaultPkg?.name || pricing?.label || category, serviceType: category, totalSessions: defaultPkg?.sessionCount || 12, pricePaid: defaultPkg?.price || pricing?.price || 12000, balanceRemaining: 0, validityDays: defaultPkg?.validityDays || 60, startDate: new Date().toISOString().split('T')[0] });
    setShowAssignModal(true);
  };

  const toggleSort = (field: typeof enrolledSort) => {
    if (enrolledSort === field) setEnrolledSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setEnrolledSort(field); setEnrolledSortDir('asc'); }
  };

  const categories = [
    { key: 'PREMIUM' as const, label: 'Premium Slot', sub: '1:1 Medical Fitness', price: '₹12,000', count: premiumCount, icon: <Star className="w-4 h-4" />, active: 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]', inactive: 'bg-white text-slate-800 border-slate-200/80 hover:border-amber-300', subActive: 'text-amber-100', subInactive: 'text-slate-400', iconActive: 'bg-white/20 text-white', iconInactive: 'bg-amber-100 text-amber-700', countActive: 'text-amber-100', countInactive: 'text-slate-500' },
    { key: 'SEMI_PRIVATE' as const, label: 'Semi-Private Slot', sub: '1:4 Clinical Rehab', price: '₹12,000', count: semiCount, icon: <Layers className="w-4 h-4" />, active: 'bg-purple-600 text-white border-purple-700 shadow-md scale-[1.02]', inactive: 'bg-white text-slate-800 border-slate-200/80 hover:border-purple-300', subActive: 'text-purple-200', subInactive: 'text-slate-400', iconActive: 'bg-white/20 text-white', iconInactive: 'bg-purple-100 text-purple-700', countActive: 'text-purple-200', countInactive: 'text-slate-500' },
    { key: 'LUXURY' as const, label: 'Luxury Slot', sub: 'Concierge Rehab', price: '₹46,000', count: luxCount, icon: <Crown className="w-4 h-4" />, active: 'bg-rose-600 text-white border-rose-700 shadow-md scale-[1.02]', inactive: 'bg-white text-slate-800 border-slate-200/80 hover:border-rose-300', subActive: 'text-rose-200', subInactive: 'text-slate-400', iconActive: 'bg-white/20 text-white', iconInactive: 'bg-rose-100 text-rose-700', countActive: 'text-rose-200', countInactive: 'text-slate-500' },
  ];
  const activeCat = categories.find(c => c.key === activeCategory)!;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Clinical Packages & Slot Roster" subtitle="Premium • Semi-Private • Luxury — pricing tiers, slot enrollments, client rosters" />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-xl ${notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-red-950/90 border-red-500/50 text-red-200'}`}>
            {notification.type === 'success' ? '✓' : '✗'} {notification.message}
          </div>
        )}

        {/* Pricing Banner */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Premium Slot', price: '₹12,000', sub: '1:1 Medical Fitness', cls: 'bg-amber-50 border-amber-200', tcls: 'text-amber-600', pcls: 'text-amber-800', scls: 'text-amber-500', ibg: 'bg-amber-100 text-amber-600', icon: <Star className="w-4 h-4" /> },
            { label: 'Semi-Private Slot', price: '₹12,000', sub: '1:4 Clinical Rehab', cls: 'bg-purple-50 border-purple-200', tcls: 'text-purple-600', pcls: 'text-purple-800', scls: 'text-purple-500', ibg: 'bg-purple-100 text-purple-600', icon: <Layers className="w-4 h-4" /> },
            { label: 'Luxury Slot', price: '₹46,000', sub: 'Concierge Rehab', cls: 'bg-rose-50 border-rose-200', tcls: 'text-rose-600', pcls: 'text-rose-800', scls: 'text-rose-500', ibg: 'bg-rose-100 text-rose-600', icon: <Crown className="w-4 h-4" /> },
          ].map((c) => (
            <div key={c.label} className={`${c.cls} border rounded-xl p-3 flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-lg ${c.ibg} flex items-center justify-center`}>{c.icon}</div>
              <div>
                <div className={`text-[10px] font-bold ${c.tcls} uppercase tracking-wider`}>{c.label}</div>
                <div className={`text-lg font-black ${c.pcls}`}>{c.price}</div>
                <div className={`text-[10px] ${c.scls}`}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setEnrolledSearch(''); }} className={`p-5 rounded-2xl text-left border transition-all ${activeCategory === cat.key ? cat.active : cat.inactive}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${activeCategory === cat.key ? cat.subActive : cat.subInactive}`}>{cat.sub}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeCategory === cat.key ? cat.iconActive : cat.iconInactive}`}>{cat.icon}</div>
              </div>
              <div className="text-xl font-black tracking-tight">{cat.label}</div>
              <div className="text-sm font-extrabold mt-0.5">{cat.price}</div>
              <div className={`text-xs mt-1 font-semibold flex items-center gap-1.5 ${activeCategory === cat.key ? cat.countActive : cat.countInactive}`}>
                <UserCheck className="w-3.5 h-3.5" /> {cat.count} Enrolled
              </div>
            </button>
          ))}
        </div>

        {/* Master Package Tiers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{activeCat.label} — Master Package Tiers</h3>
              <p className="text-xs text-slate-400">Base price: <strong>{activeCat.price}</strong> per enrollment</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setNewClientForm(f => ({ ...f, category: activeCategory })); setShowNewClientModal(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition">
                <UserPlus className="w-4 h-4" /> + New Client
              </button>
              <button onClick={() => openAssignModal(activeCategory)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition">
                <UserCheck className="w-4 h-4" /> + Enroll Client
              </button>
              {canEdit && (
                <button onClick={() => { setPackageForm({ name: '', serviceType: activeCategory, sessionCount: 12, price: CATEGORY_PRICING[activeCategory]?.price || 12000, validityDays: 60 }); setShowCreatePackageModal(true); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">
                  <PlusCircle className="w-4 h-4" /> + Create Tier
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredMasterPackages.length === 0 ? (
              <div className="col-span-3 py-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No tiers configured. Click <strong>+ Create Tier</strong> to add one.
              </div>
            ) : (
              filteredMasterPackages.map((pkg) => (
                <div key={pkg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">{pkg.name}</h4>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{formatCurrency(pkg.price)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 font-medium">
                    <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-slate-400" />{pkg.sessionCount} Sessions</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{pkg.validityDays} Days</span>
                  </div>
                  <button onClick={() => { setAssignForm(f => ({ ...f, packageId: pkg.id, name: pkg.name, totalSessions: pkg.sessionCount, pricePaid: pkg.price, serviceType: pkg.serviceType })); setShowAssignModal(true); }} className="mt-3 w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition">
                    Enroll Client in This Tier
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enrolled Clients Table with Search + Sort */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Slot Roster — {activeCat.label}</h3>
                <p className="text-xs text-slate-400">{enrolledSorted.length} of {enrolledBase.length} clients shown</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                  <input type="text" placeholder="Search name, ID, phone..." value={enrolledSearch} onChange={(e) => setEnrolledSearch(e.target.value)} className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-slate-50 focus:bg-white focus:border-blue-400 outline-none w-52" />
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{enrolledBase.length} Enrolled</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-slate-800" onClick={() => toggleSort('name')}>Client <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-slate-800" onClick={() => toggleSort('sessions')}>Sessions <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-slate-800" onClick={() => toggleSort('expiry')}>Expiry <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-slate-800" onClick={() => toggleSort('payment')}>Payment <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400">Loading...</td></tr>
                ) : enrolledSorted.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400">
                    {enrolledSearch ? `No results for "${enrolledSearch}"` : 'No clients enrolled.'}{' '}
                    {!enrolledSearch && <button onClick={() => openAssignModal(activeCategory)} className="text-emerald-600 font-bold hover:underline ml-1">Enroll Now</button>}
                  </td></tr>
                ) : (
                  enrolledSorted.map((cp) => {
                    const pct = Math.round((cp.sessionsUsed / cp.totalSessions) * 100) || 0;
                    const paid = (cp.balanceRemaining || 0) <= 0;
                    return (
                      <tr key={cp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link href={`/dashboard/clients/${cp.client?.id}`} className="font-bold text-slate-900 hover:text-emerald-600 block">{cp.client?.name}</Link>
                          <span className="text-[10px] font-mono text-slate-400">{cp.client?.clientId} • {cp.client?.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{cp.name}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>{cp.sessionsRemaining} left</span>
                            <span className="text-slate-400">{cp.sessionsUsed}/{cp.totalSessions}</span>
                          </div>
                          <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${100 - pct}%` }} />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">{formatDate(cp.expiryDate)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${paid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                            {paid ? '✓ Fully Paid' : `Due: ${formatCurrency(cp.balanceRemaining)}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">{cp.status}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/dashboard/slot-booking?category=${activeCategory}&client=${cp.client?.id}`} className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Book Slot
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Assign/Enroll Client */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Enroll Client into Package</h3>
                  <p className="text-xs text-slate-400">Assign sessions & record payment details</p>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAssignPackage} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Client *</label>
                  <select value={assignForm.clientId} onChange={(e) => setAssignForm({ ...assignForm, clientId: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none" required>
                    <option value="">-- Choose Client --</option>
                    {allClients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.clientId}) — {c.phone}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Slot Category</label>
                    <select value={assignForm.serviceType} onChange={(e) => { const p = CATEGORY_PRICING[e.target.value]; setAssignForm({ ...assignForm, serviceType: e.target.value, pricePaid: p?.price || 12000 }); }} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none">
                      <option value="PREMIUM">Premium 1:1 — ₹12,000</option>
                      <option value="SEMI_PRIVATE">Semi-Private 1:4 — ₹12,000</option>
                      <option value="LUXURY">Luxury Concierge — ₹46,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Sessions</label>
                    <input type="number" value={assignForm.totalSessions} onChange={(e) => setAssignForm({ ...assignForm, totalSessions: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Package Name</label>
                  <input type="text" value={assignForm.name} onChange={(e) => setAssignForm({ ...assignForm, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount Paid (₹)</label>
                    <input type="number" value={assignForm.pricePaid} onChange={(e) => setAssignForm({ ...assignForm, pricePaid: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Balance Due (₹)</label>
                    <input type="number" value={assignForm.balanceRemaining} onChange={(e) => setAssignForm({ ...assignForm, balanceRemaining: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 focus:bg-white focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                    <input type="date" value={assignForm.startDate} onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Validity (Days)</label>
                    <input type="number" value={assignForm.validityDays} onChange={(e) => setAssignForm({ ...assignForm, validityDays: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none" />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md">Enroll Client</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Master Package Tier */}
        {showCreatePackageModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Create Master Package Tier</h3>
                <button onClick={() => setShowCreatePackageModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreatePackage} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Package Title *</label>
                  <input type="text" placeholder="e.g. Premium Spine Rehab 12 Sessions" value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Slot Category</label>
                    <select value={packageForm.serviceType} onChange={(e) => { const p = CATEGORY_PRICING[e.target.value]; setPackageForm({ ...packageForm, serviceType: e.target.value, price: p?.price || 12000 }); }} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none">
                      <option value="PREMIUM">Premium 1:1</option>
                      <option value="SEMI_PRIVATE">Semi-Private 1:4</option>
                      <option value="LUXURY">Luxury Concierge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Session Count</label>
                    <input type="number" value={packageForm.sessionCount} onChange={(e) => setPackageForm({ ...packageForm, sessionCount: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹)</label>
                    <input type="number" value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 focus:bg-white focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Validity (Days)</label>
                    <input type="number" value={packageForm.validityDays} onChange={(e) => setPackageForm({ ...packageForm, validityDays: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none" required />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowCreatePackageModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md">Save Package Tier</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Register New Client */}
        {showNewClientModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Register New Client — {activeCat.label}
                </span>
                <button onClick={() => setShowNewClientModal(false)} className="text-slate-300 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleRegisterNewClient} className="p-5 space-y-3.5">
                <div className={`p-3 rounded-lg text-xs font-semibold border ${activeCategory === 'PREMIUM' ? 'bg-amber-50 border-amber-200 text-amber-700' : activeCategory === 'SEMI_PRIVATE' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                  📋 Registering under <strong>{activeCat.label}</strong> ({activeCat.price})
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input type="text" required value={newClientForm.name} onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:bg-white focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                    <input type="text" required value={newClientForm.phone} onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:bg-white focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" value={newClientForm.email} onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:bg-white focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select value={newClientForm.gender} onChange={(e) => setNewClientForm({ ...newClientForm, gender: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:bg-white focus:border-blue-500 outline-none">
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slot Start Date</label>
                  <input type="date" value={newClientForm.slotBookingDate} onChange={(e) => setNewClientForm({ ...newClientForm, slotBookingDate: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:bg-white focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Referral</label>
                    <select value={newClientForm.referralSource} onChange={(e) => setNewClientForm({ ...newClientForm, referralSource: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:bg-white focus:border-blue-500 outline-none">
                      <option>Doctor Referral</option><option>Instagram</option><option>Walk-in</option><option>Google</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Specialist</label>
                    <select value={newClientForm.assignedSpecialistId} onChange={(e) => setNewClientForm({ ...newClientForm, assignedSpecialistId: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:bg-white focus:border-blue-500 outline-none">
                      <option value="">-- Unassigned --</option>
                      {specialists.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                  <button type="button" onClick={() => setShowNewClientModal(false)} className="px-3.5 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow transition">Register Client</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
