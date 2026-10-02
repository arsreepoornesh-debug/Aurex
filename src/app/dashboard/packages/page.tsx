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
  Star,
  Sparkles,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { canManageMasterPackages } from '@/lib/rbac';

const CATEGORY_PRICING: Record<string, { price: number; label: string; sessions: number; validity: number }> = {
  PREMIUM:      { price: 12000, label: 'Premium 1:1 Slot',       sessions: 12, validity: 60 },
  SEMI_PRIVATE: { price: 12000, label: 'Semi-Private 1:4 Slot',  sessions: 12, validity: 60 },
  LUXURY:       { price: 46000, label: 'Luxury Concierge Slot',  sessions: 12, validity: 60 },
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
  
  // Category selector: 'ALL' | 'SEMI_PRIVATE' | 'PREMIUM' | 'LUXURY'
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'SEMI_PRIVATE' | 'PREMIUM' | 'LUXURY'>('ALL');
  const [enrolledSearch, setEnrolledSearch] = useState('');
  const [enrolledSort, setEnrolledSort] = useState<'name' | 'expiry' | 'sessions' | 'payment'>('name');
  const [enrolledSortDir, setEnrolledSortDir] = useState<'asc' | 'desc'>('asc');
  
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [packageForm, setPackageForm] = useState({ name: '', serviceType: 'SEMI_PRIVATE', sessionCount: 12, price: 12000, validityDays: 60 });
  const [assignForm, setAssignForm] = useState({ clientId: '', packageId: '', name: '', serviceType: 'SEMI_PRIVATE', totalSessions: 12, pricePaid: 12000, balanceRemaining: 0, validityDays: 60, startDate: new Date().toISOString().split('T')[0] });
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '', gender: 'Male', referralSource: 'Walk-in', assignedSpecialistId: '', category: 'SEMI_PRIVATE', slotBookingDate: '', status: 'ACTIVE' });

  function showMsg(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [pkgRes, clientRes, specRes] = await Promise.all([
        fetch('/api/packages'), 
        fetch('/api/clients'), 
        fetch('/api/specialists')
      ]);
      const pkgData = await pkgRes.json();
      const clData = await clientRes.json();
      const spData = await specRes.json();
      
      const pkgs = pkgData.packages || (Array.isArray(pkgData) ? pkgData : []);
      const clPkgs = pkgData.clientPackages || [];
      
      setPackages(pkgs);
      setClientPackages(clPkgs);
      setAllClients(Array.isArray(clData) ? clData : []);
      setSpecialists(Array.isArray(spData) ? spData : []);
    } catch (err) { 
      console.error('Error loading package data:', err); 
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { loadData(); }, []);

  const semiCount = clientPackages.filter((cp) => cp.serviceType === 'SEMI_PRIVATE').length;
  const premiumCount = clientPackages.filter((cp) => cp.serviceType === 'PREMIUM').length;
  const luxCount = clientPackages.filter((cp) => cp.serviceType === 'LUXURY').length;

  const filteredMasterPackages = activeCategory === 'ALL' 
    ? packages 
    : packages.filter((p) => p.serviceType === activeCategory);

  const enrolledBase = activeCategory === 'ALL'
    ? clientPackages
    : clientPackages.filter((cp) => cp.serviceType === activeCategory);

  const enrolledFiltered = enrolledBase.filter((cp) => {
    const q = enrolledSearch.toLowerCase();
    if (!q) return true;
    return (
      cp.client?.name?.toLowerCase().includes(q) || 
      cp.client?.clientId?.toLowerCase().includes(q) || 
      cp.client?.phone?.includes(q) || 
      cp.name?.toLowerCase().includes(q)
    );
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

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/packages', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(packageForm) 
    });
    if (res.ok) { 
      setShowCreatePackageModal(false); 
      loadData(); 
      showMsg('success', 'Master Package tier created!'); 
    } else { 
      const err = await res.json(); 
      showMsg('error', err.error || 'Failed to create tier'); 
    }
  };

  const handleAssignPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.clientId) { showMsg('error', 'Please select a client.'); return; }
    const res = await fetch('/api/packages/assign', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(assignForm) 
    });
    if (res.ok) { 
      setShowAssignModal(false); 
      loadData(); 
      showMsg('success', 'Client successfully enrolled in package!'); 
    } else { 
      const err = await res.json(); 
      showMsg('error', err.error || 'Failed to assign package'); 
    }
  };

  const handleRegisterNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/clients', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(newClientForm) 
    });
    if (res.ok) {
      setShowNewClientModal(false);
      setNewClientForm({ 
        name: '', 
        phone: '', 
        email: '', 
        gender: 'Male', 
        referralSource: 'Walk-in', 
        assignedSpecialistId: '', 
        category: activeCategory === 'ALL' ? 'SEMI_PRIVATE' : activeCategory, 
        slotBookingDate: '', 
        status: 'ACTIVE' 
      });
      loadData(); 
      showMsg('success', 'Client registered successfully!');
    } else { 
      const err = await res.json(); 
      showMsg('error', err.error || 'Failed to register client'); 
    }
  };

  const openAssignModal = (category: string) => {
    const catKey = category === 'ALL' ? 'SEMI_PRIVATE' : category;
    const pricing = CATEGORY_PRICING[catKey];
    const defaultPkg = packages.find((p) => p.serviceType === catKey);
    
    setAssignForm({ 
      clientId: allClients[0]?.id || '', 
      packageId: defaultPkg?.id || '', 
      name: defaultPkg?.name || pricing?.label || 'Clinical Package', 
      serviceType: catKey, 
      totalSessions: defaultPkg?.sessionCount || 12, 
      pricePaid: defaultPkg?.price || pricing?.price || 12000, 
      balanceRemaining: 0, 
      validityDays: defaultPkg?.validityDays || 60, 
      startDate: new Date().toISOString().split('T')[0] 
    });
    setShowAssignModal(true);
  };

  const toggleSort = (field: typeof enrolledSort) => {
    if (enrolledSort === field) setEnrolledSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setEnrolledSort(field); setEnrolledSortDir('asc'); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        title="Clinical Packages & Slot Roster" 
        subtitle="Manage master pricing (Semi-Private ₹12k, Premium ₹12k, Luxury ₹46k), client roster, remaining sessions, dues & expiries" 
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-xl ${notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-red-950/90 border-red-500/50 text-red-200'}`}>
            {notification.type === 'success' ? '✓' : '✕'} {notification.message}
          </div>
        )}

        {/* Top Category Filter Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* ALL Packages Card */}
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`p-4 rounded-2xl border text-left transition-all shadow-sm ${
              activeCategory === 'ALL'
                ? 'bg-slate-900 text-white border-slate-950 shadow-md scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black uppercase tracking-wider ${activeCategory === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
                All Packages
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black">{clientPackages.length} Enrolled</div>
            <p className={`text-[11px] mt-1 font-medium ${activeCategory === 'ALL' ? 'text-slate-300' : 'text-slate-400'}`}>
              Master Catalog ({packages.length} Tiers)
            </p>
          </button>

          {/* Semi-Private Card (₹12,000) */}
          <button
            onClick={() => setActiveCategory('SEMI_PRIVATE')}
            className={`p-4 rounded-2xl border text-left transition-all shadow-sm ${
              activeCategory === 'SEMI_PRIVATE'
                ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black uppercase tracking-wider ${activeCategory === 'SEMI_PRIVATE' ? 'text-purple-200' : 'text-purple-700'}`}>
                Semi-Private (1:4)
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeCategory === 'SEMI_PRIVATE' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black">₹12,000</div>
            <p className={`text-[11px] mt-1 font-medium ${activeCategory === 'SEMI_PRIVATE' ? 'text-purple-200' : 'text-slate-500'}`}>
              {semiCount} Active Clients
            </p>
          </button>

          {/* Premium 1:1 Card (₹12,000) */}
          <button
            onClick={() => setActiveCategory('PREMIUM')}
            className={`p-4 rounded-2xl border text-left transition-all shadow-sm ${
              activeCategory === 'PREMIUM'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black uppercase tracking-wider ${activeCategory === 'PREMIUM' ? 'text-amber-100' : 'text-amber-700'}`}>
                Premium 1:1
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeCategory === 'PREMIUM' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black">₹12,000</div>
            <p className={`text-[11px] mt-1 font-medium ${activeCategory === 'PREMIUM' ? 'text-amber-100' : 'text-slate-500'}`}>
              {premiumCount} Active Clients
            </p>
          </button>

          {/* Luxury Card (₹46,000) */}
          <button
            onClick={() => setActiveCategory('LUXURY')}
            className={`p-4 rounded-2xl border text-left transition-all shadow-sm ${
              activeCategory === 'LUXURY'
                ? 'bg-rose-600 text-white border-rose-700 shadow-md scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black uppercase tracking-wider ${activeCategory === 'LUXURY' ? 'text-rose-200' : 'text-rose-700'}`}>
                Luxury Concierge
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeCategory === 'LUXURY' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'}`}>
                <Crown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black">₹46,000</div>
            <p className={`text-[11px] mt-1 font-medium ${activeCategory === 'LUXURY' ? 'text-rose-200' : 'text-slate-500'}`}>
              {luxCount} Active Clients
            </p>
          </button>
        </div>

        {/* Master Catalog Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Master Pricing Catalog ({filteredMasterPackages.length} Tiers)
              </h3>
              <p className="text-xs text-slate-400">Standard price book, ratios, and validity settings</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAssignModal(activeCategory)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Enroll Client</span>
              </button>
              {canEdit && (
                <button
                  onClick={() => setShowCreatePackageModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>+ Create Tier</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredMasterPackages.length === 0 ? (
              <div className="col-span-3 py-8 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No packages defined in this view.
              </div>
            ) : (
              filteredMasterPackages.map((pkg) => (
                <div key={pkg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{pkg.name}</h4>
                      <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {formatCurrency(pkg.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 font-medium">
                      <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-slate-400" />{pkg.sessionCount} Sessions</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />{pkg.validityDays} Days</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">{pkg.serviceType.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAssignForm(f => ({
                        ...f,
                        packageId: pkg.id,
                        name: pkg.name,
                        totalSessions: pkg.sessionCount,
                        pricePaid: pkg.price,
                        serviceType: pkg.serviceType,
                        validityDays: pkg.validityDays
                      }));
                      setShowAssignModal(true);
                    }}
                    className="mt-3 w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    Enroll Client in This Tier
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enrolled Clients Roster Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Client Package Roster {activeCategory !== 'ALL' && `– ${activeCategory.replace('_', ' ')}`}
              </h3>
              <p className="text-xs text-slate-400">Showing {enrolledSorted.length} enrolled clients</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search client, phone, ID..."
                  value={enrolledSearch}
                  onChange={(e) => setEnrolledSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl whitespace-nowrap">
                {enrolledBase.length} Total
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-slate-800" onClick={() => toggleSort('name')}>Client <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className="py-3 px-4">Package Enrolled</th>
                  <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-slate-800" onClick={() => toggleSort('sessions')}>Sessions Left <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className="py-3 px-4"><button className="flex items-center gap-1 hover:text-slate-800" onClick={() => toggleSort('expiry')}>Expiry Date <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className="py-3 px-4 text-right"><button className="flex items-center gap-1 hover:text-slate-800 ml-auto" onClick={() => toggleSort('payment')}>Due Balance <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400">Loading package records...</td></tr>
                ) : enrolledSorted.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400">
                    {enrolledSearch ? `No clients found matching "${enrolledSearch}"` : 'No clients currently enrolled in this tier.'}
                  </td></tr>
                ) : (
                  enrolledSorted.map((cp) => {
                    const pct = Math.round((cp.sessionsUsed / cp.totalSessions) * 100) || 0;
                    const isDue = (cp.balanceRemaining || 0) > 0;
                    return (
                      <tr key={cp.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <Link href={`/dashboard/clients/${cp.client?.id || cp.clientId}`} className="font-extrabold text-slate-900 hover:text-emerald-600 block">
                            {cp.client?.name}
                          </Link>
                          <span className="text-[10px] font-mono text-slate-400">{cp.client?.clientId} • {cp.client?.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mr-1.5 ${
                            cp.serviceType === 'SEMI_PRIVATE' ? 'bg-purple-100 text-purple-700' :
                            cp.serviceType === 'PREMIUM' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {cp.serviceType.replace('_', ' ')}
                          </span>
                          {cp.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1 w-32">
                            <span>{cp.sessionsRemaining} left</span>
                            <span className="text-slate-400">{cp.sessionsUsed}/{cp.totalSessions}</span>
                          </div>
                          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${100 - pct}%` }} />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {formatDate(cp.expiryDate)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold">
                          {isDue ? (
                            <span className="text-rose-600 font-black">Due: {formatCurrency(cp.balanceRemaining)}</span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">✓ Paid</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {cp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/dashboard/slot-booking?category=${cp.serviceType}&client=${cp.client?.id || cp.clientId}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              Book Slot
                            </Link>
                            {isDue && (
                              <Link
                                href={`/dashboard/payments`}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition flex items-center gap-1"
                              >
                                Collect Due
                              </Link>
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
        </div>

        {/* Modal: Create Master Package Tier */}
        {showCreatePackageModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  Create Master Package Tier
                </span>
                <button onClick={() => setShowCreatePackageModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePackage} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Package Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Semi-Private 12-Pack"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={packageForm.serviceType}
                      onChange={(e) => setPackageForm({ ...packageForm, serviceType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                    >
                      <option value="SEMI_PRIVATE">Semi-Private (1:4)</option>
                      <option value="PREMIUM">Premium (1:1)</option>
                      <option value="LUXURY">Luxury Concierge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Session Count</label>
                    <input
                      type="number"
                      value={packageForm.sessionCount}
                      onChange={(e) => setPackageForm({ ...packageForm, sessionCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Validity (Days)</label>
                    <input
                      type="number"
                      value={packageForm.validityDays}
                      onChange={(e) => setPackageForm({ ...packageForm, validityDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreatePackageModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    Save Package Tier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Enroll / Assign Client Package */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  Enroll Client in Package
                </span>
                <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignPackage} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Client *</label>
                  <select
                    value={assignForm.clientId}
                    onChange={(e) => setAssignForm({ ...assignForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                    required
                  >
                    <option value="">-- Select Client --</option>
                    {allClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.clientId}) – {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Package Name</label>
                  <input
                    type="text"
                    value={assignForm.name}
                    onChange={(e) => setAssignForm({ ...assignForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Sessions</label>
                    <input
                      type="number"
                      value={assignForm.totalSessions}
                      onChange={(e) => setAssignForm({ ...assignForm, totalSessions: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Validity (Days)</label>
                    <input
                      type="number"
                      value={assignForm.validityDays}
                      onChange={(e) => setAssignForm({ ...assignForm, validityDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount Paid (₹)</label>
                    <input
                      type="number"
                      value={assignForm.pricePaid}
                      onChange={(e) => {
                        const paid = Number(e.target.value);
                        const total = assignForm.serviceType === 'LUXURY' ? 46000 : 12000;
                        setAssignForm({ 
                          ...assignForm, 
                          pricePaid: paid, 
                          balanceRemaining: Math.max(0, total - paid) 
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Due Balance (₹)</label>
                    <input
                      type="number"
                      value={assignForm.balanceRemaining}
                      onChange={(e) => setAssignForm({ ...assignForm, balanceRemaining: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    Confirm Enrollment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
