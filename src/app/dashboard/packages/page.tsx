'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Sparkles,
  Layers,
  Users,
  Globe,
  Calendar,
  CreditCard,
  UserCheck,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { canManageMasterPackages } from '@/lib/rbac';

export default function PackagesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';
  const canEdit = canManageMasterPackages(userRole);

  const [packages, setPackages] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Category Tab: 'PRIVATE' | 'SEMI_PRIVATE' | 'GROUP' | 'ONLINE'
  const [activeCategory, setActiveCategory] = useState<'PRIVATE' | 'SEMI_PRIVATE' | 'GROUP' | 'ONLINE'>('PRIVATE');

  // Modals
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Form: Create Master Package
  const [packageForm, setPackageForm] = useState({
    name: '',
    serviceType: 'PREMIUM',
    sessionCount: 12,
    price: 48000,
    validityDays: 60,
  });

  // Form: Assign Package to Client
  const [assignForm, setAssignForm] = useState({
    clientId: '',
    packageId: '',
    name: '',
    serviceType: 'PREMIUM',
    totalSessions: 12,
    pricePaid: 0,
    balanceRemaining: 0,
    validityDays: 60,
    startDate: new Date().toISOString().split('T')[0],
  });

  async function loadData() {
    setLoading(true);
    try {
      const [pkgRes, clientRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/clients'),
      ]);
      const pkgData = await pkgRes.json();
      const clData = await clientRes.json();

      setPackages(pkgData.packages || []);
      setClientPackages(pkgData.clientPackages || []);
      setAllClients(Array.isArray(clData) ? clData : []);
    } catch (err) {
      console.error('Error loading package data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter packages & clients by category
  const getCategoryFilter = (cat: string) => {
    if (cat === 'PRIVATE') return (item: any) => item.serviceType === 'PREMIUM';
    if (cat === 'SEMI_PRIVATE') return (item: any) => item.serviceType === 'SEMI_PRIVATE';
    if (cat === 'GROUP') return (item: any) => item.serviceType === 'GROUP';
    if (cat === 'ONLINE') return (item: any) => item.serviceType === 'ONLINE';
    return () => true;
  };

  const filteredMasterPackages = packages.filter(getCategoryFilter(activeCategory));
  const filteredEnrolledClients = clientPackages.filter(getCategoryFilter(activeCategory));

  // Category counts
  const privateCount = clientPackages.filter((cp) => cp.serviceType === 'PREMIUM').length;
  const semiPrivateCount = clientPackages.filter((cp) => cp.serviceType === 'SEMI_PRIVATE').length;
  const groupCount = clientPackages.filter((cp) => cp.serviceType === 'GROUP').length;
  const onlineCount = clientPackages.filter((cp) => cp.serviceType === 'ONLINE').length;

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageForm),
      });

      if (res.ok) {
        setShowCreatePackageModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create package');
      }
    } catch (err) {
      alert('Error creating package');
    }
  };

  const handleAssignPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.clientId) {
      alert('Please select a client.');
      return;
    }

    try {
      const res = await fetch('/api/packages/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignForm),
      });

      if (res.ok) {
        setShowAssignModal(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to assign package');
      }
    } catch (err) {
      alert('Error assigning package');
    }
  };

  const openAssignModalForCategory = (category: string) => {
    const serviceType = category === 'PRIVATE' ? 'PREMIUM' : category;
    const defaultPkg = packages.find((p) => p.serviceType === serviceType);
    setAssignForm({
      clientId: allClients[0]?.id || '',
      packageId: defaultPkg?.id || '',
      name: defaultPkg?.name || (category === 'PRIVATE' ? 'Private 1:1 Medical Fitness' : category === 'SEMI_PRIVATE' ? 'Semi-Private 1:4 Clinical' : category === 'GROUP' ? 'Group Clinical Sessions' : 'Online Tele-Rehab Package'),
      serviceType: serviceType,
      totalSessions: defaultPkg?.sessionCount || 12,
      pricePaid: defaultPkg?.price || 24000,
      balanceRemaining: 0,
      validityDays: defaultPkg?.validityDays || 60,
      startDate: new Date().toISOString().split('T')[0],
    });
    setShowAssignModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Clinical Packages & Enrolled Clients"
        subtitle="Manage master clinical session packages and view respective enrolled clients for Private, Semi-Private, Group, and Online sessions"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* 4 Category Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category 1: Private Client Packages */}
          <button
            onClick={() => setActiveCategory('PRIVATE')}
            className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden ${
              activeCategory === 'PRIVATE'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200/80 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeCategory === 'PRIVATE' ? 'text-amber-100' : 'text-slate-400'}`}>
                1:1 Medical Fitness
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeCategory === 'PRIVATE' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black tracking-tight">Private Packages</div>
            <div className={`text-xs mt-1 font-semibold flex items-center gap-1.5 ${activeCategory === 'PRIVATE' ? 'text-amber-100' : 'text-slate-500'}`}>
              <UserCheck className="w-3.5 h-3.5" />
              {privateCount} Enrolled Clients
            </div>
          </button>

          {/* Category 2: Semi-Private Client Packages */}
          <button
            onClick={() => setActiveCategory('SEMI_PRIVATE')}
            className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden ${
              activeCategory === 'SEMI_PRIVATE'
                ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200/80 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeCategory === 'SEMI_PRIVATE' ? 'text-purple-200' : 'text-slate-400'}`}>
                1:4 Clinical Rehab
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeCategory === 'SEMI_PRIVATE' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black tracking-tight">Semi-Private</div>
            <div className={`text-xs mt-1 font-semibold flex items-center gap-1.5 ${activeCategory === 'SEMI_PRIVATE' ? 'text-purple-200' : 'text-slate-500'}`}>
              <UserCheck className="w-3.5 h-3.5" />
              {semiPrivateCount} Enrolled Clients
            </div>
          </button>

          {/* Category 3: Group Session Packages */}
          <button
            onClick={() => setActiveCategory('GROUP')}
            className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden ${
              activeCategory === 'GROUP'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200/80 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeCategory === 'GROUP' ? 'text-emerald-200' : 'text-slate-400'}`}>
                Group Conditioning
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeCategory === 'GROUP' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black tracking-tight">Group Sessions</div>
            <div className={`text-xs mt-1 font-semibold flex items-center gap-1.5 ${activeCategory === 'GROUP' ? 'text-emerald-200' : 'text-slate-500'}`}>
              <UserCheck className="w-3.5 h-3.5" />
              {groupCount} Enrolled Clients
            </div>
          </button>

          {/* Category 4: Online Client Packages */}
          <button
            onClick={() => setActiveCategory('ONLINE')}
            className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden ${
              activeCategory === 'ONLINE'
                ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200/80 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeCategory === 'ONLINE' ? 'text-blue-200' : 'text-slate-400'}`}>
                Tele-Rehab & Virtual
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeCategory === 'ONLINE' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black tracking-tight">Online Clients</div>
            <div className={`text-xs mt-1 font-semibold flex items-center gap-1.5 ${activeCategory === 'ONLINE' ? 'text-blue-200' : 'text-slate-500'}`}>
              <UserCheck className="w-3.5 h-3.5" />
              {onlineCount} Enrolled Clients
            </div>
          </button>
        </div>

        {/* Master Catalog Tier Cards for Current Category */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {activeCategory === 'PRIVATE' && 'Private 1:1 Medical Fitness Packages'}
                {activeCategory === 'SEMI_PRIVATE' && 'Semi-Private 1:4 Clinical Rehab Packages'}
                {activeCategory === 'GROUP' && 'Group Mobility & Conditioning Packages'}
                {activeCategory === 'ONLINE' && 'Online Remote Tele-Rehab Packages'}
              </h3>
              <p className="text-xs text-slate-400">
                Master pricing tiers, session counts, and validity periods for this category
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAssignModalForCategory(activeCategory)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <UserPlus className="w-4 h-4" />
                + Enroll Client in Package
              </button>

              {canEdit && (
                <button
                  onClick={() => {
                    setPackageForm({
                      name: '',
                      serviceType: activeCategory === 'PRIVATE' ? 'PREMIUM' : activeCategory,
                      sessionCount: 12,
                      price: 24000,
                      validityDays: 60,
                    });
                    setShowCreatePackageModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  + Create Master Tier
                </button>
              )}
            </div>
          </div>

          {/* Master Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredMasterPackages.length === 0 ? (
              <div className="col-span-3 py-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No master package tiers configured for this category yet. Click <strong>+ Create Master Tier</strong> or assign directly.
              </div>
            ) : (
              filteredMasterPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">{pkg.name}</h4>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {formatCurrency(pkg.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 font-medium">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      {pkg.sessionCount} Sessions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {pkg.validityDays} Days Validity
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Respective Enrolled Clients Table for Selected Category */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Clients Enrolled in{' '}
                {activeCategory === 'PRIVATE' && 'Private 1:1 Packages'}
                {activeCategory === 'SEMI_PRIVATE' && 'Semi-Private 1:4 Packages'}
                {activeCategory === 'GROUP' && 'Group Session Packages'}
                {activeCategory === 'ONLINE' && 'Online Client Packages'}
              </h3>
              <p className="text-xs text-slate-400">
                Respective client roster, active session balances, validity dates, and payment status
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {filteredEnrolledClients.length} Enrolled Clients
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Enrolled Package</th>
                  <th className="py-3 px-4">Session Progress</th>
                  <th className="py-3 px-4">Validity / Expiry</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrolledClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No clients currently enrolled in this package category.{' '}
                      <button
                        onClick={() => openAssignModalForCategory(activeCategory)}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Enroll a Client Now
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredEnrolledClients.map((cp) => {
                    const percentUsed = Math.round((cp.sessionsUsed / cp.totalSessions) * 100) || 0;
                    const isFullyPaid = (cp.balanceRemaining || 0) <= 0;

                    return (
                      <tr key={cp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/dashboard/clients/${cp.client?.id}`}
                            className="font-bold text-slate-900 hover:text-emerald-600 transition block"
                          >
                            {cp.client?.name}
                          </Link>
                          <span className="text-[10px] font-mono text-slate-400">
                            {cp.client?.clientId} • {cp.client?.phone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {cp.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>{cp.sessionsRemaining} remaining</span>
                            <span className="text-slate-400">{cp.sessionsUsed}/{cp.totalSessions} used</span>
                          </div>
                          <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${100 - percentUsed}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {formatDate(cp.expiryDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isFullyPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {isFullyPaid ? '✓ Fully Paid' : `Due: ${formatCurrency(cp.balanceRemaining)}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {cp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dashboard/bookings?client=${cp.client?.id}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition inline-flex items-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Book
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

        {/* Modal: Assign Package to Client */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Enroll Client into Package</h3>
                    <p className="text-xs text-slate-400">Assign clinical sessions & record payment details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignPackage} className="mt-4 space-y-4">
                {/* Select Client */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Client *
                  </label>
                  <select
                    value={assignForm.clientId}
                    onChange={(e) => setAssignForm({ ...assignForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  >
                    <option value="">-- Choose Client --</option>
                    {allClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.clientId}) — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Package Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Service Category
                    </label>
                    <select
                      value={assignForm.serviceType}
                      onChange={(e) => setAssignForm({ ...assignForm, serviceType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="PREMIUM">Private 1:1 Medical Fitness</option>
                      <option value="SEMI_PRIVATE">Semi-Private 1:4 Clinical</option>
                      <option value="GROUP">Group Conditioning</option>
                      <option value="ONLINE">Online Tele-Rehab</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Total Sessions
                    </label>
                    <input
                      type="number"
                      value={assignForm.totalSessions}
                      onChange={(e) => setAssignForm({ ...assignForm, totalSessions: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Package Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Package Name
                  </label>
                  <input
                    type="text"
                    value={assignForm.name}
                    onChange={(e) => setAssignForm({ ...assignForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Payment & Balance */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      value={assignForm.pricePaid}
                      onChange={(e) => setAssignForm({ ...assignForm, pricePaid: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Balance Due (₹)
                    </label>
                    <input
                      type="number"
                      value={assignForm.balanceRemaining}
                      onChange={(e) => setAssignForm({ ...assignForm, balanceRemaining: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                  >
                    Enroll Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Master Package */}
        {showCreatePackageModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Create Master Package Tier</h3>
                <button
                  onClick={() => setShowCreatePackageModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePackage} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Semi-Private Spine Rehab 24 Sessions"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Service Category
                    </label>
                    <select
                      value={packageForm.serviceType}
                      onChange={(e) => setPackageForm({ ...packageForm, serviceType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="PREMIUM">Private 1:1</option>
                      <option value="SEMI_PRIVATE">Semi-Private 1:4</option>
                      <option value="GROUP">Group Conditioning</option>
                      <option value="ONLINE">Online Tele-Rehab</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Session Count
                    </label>
                    <input
                      type="number"
                      value={packageForm.sessionCount}
                      onChange={(e) => setPackageForm({ ...packageForm, sessionCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Validity (Days)
                    </label>
                    <input
                      type="number"
                      value={packageForm.validityDays}
                      onChange={(e) => setPackageForm({ ...packageForm, validityDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreatePackageModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                  >
                    Save Master Package
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
