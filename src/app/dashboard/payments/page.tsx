'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  FileSpreadsheet, 
  CreditCard,
  User,
  Calendar,
  DollarSign,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Printer,
  ChevronRight,
  Receipt,
  ArrowUpRight,
  Filter,
  Crown,
  AlertTriangle,
  RefreshCw,
  Phone,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Header } from '@/components/layout/Header';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab view: 'DUE_PAYMENTS' | 'EXPIRING' | 'SEMI_PRIVATE' | 'PREMIUM' | 'LUXURY' | 'ALL' | 'PAID'
  const [activeTab, setActiveTab] = useState<'DUE_PAYMENTS' | 'EXPIRING' | 'SEMI_PRIVATE' | 'PREMIUM' | 'LUXURY' | 'ALL' | 'PAID'>('DUE_PAYMENTS');
  
  // Payment Modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<any | null>(null);
  const [receiptModalPayment, setReceiptModalPayment] = useState<any | null>(null);

  const [form, setForm] = useState({
    clientId: '',
    clientPackageId: '',
    amount: '',
    paymentMethod: 'UPI',
    notes: '',
    isRefund: false,
  });

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      setPayments(data.payments || []);
      setClientPackages(data.clientPackages || []);
      setAllClients(data.clients || []);
    } catch (err) {
      console.error('Error loading payment data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const now = new Date();

  // Compute Active Paid Clients vs Due / Outstanding Balances
  const activePaidPackages = clientPackages.filter((cp) => (cp.balanceRemaining || 0) <= 0);
  const duePaymentPackages = clientPackages.filter((cp) => (cp.balanceRemaining || 0) > 0);
  
  // Categories
  const semiPrivatePackages = clientPackages.filter((cp) => cp.serviceType === 'SEMI_PRIVATE');
  const premiumPackages = clientPackages.filter((cp) => cp.serviceType === 'PREMIUM');
  const luxuryPackages = clientPackages.filter((cp) => cp.serviceType === 'LUXURY');

  // Expiring Packages (Expiring in <= 15 days or already expired)
  const expiringPackages = [...clientPackages].map((cp) => {
    const expDate = new Date(cp.expiryDate);
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let expiryStatus: 'EXPIRED' | 'CRITICAL' | 'EXPIRING_SOON' | 'HEALTHY' = 'HEALTHY';
    if (diffDays < 0) expiryStatus = 'EXPIRED';
    else if (diffDays <= 5) expiryStatus = 'CRITICAL';
    else if (diffDays <= 15) expiryStatus = 'EXPIRING_SOON';
    return { ...cp, diffDays, expiryStatus };
  }).sort((a, b) => a.diffDays - b.diffDays);

  // Compute Total Metrics
  const totalCollected = payments.reduce((acc, p) => acc + (p.isRefund ? -p.amount : p.amount), 0);
  const totalOutstandingDues = duePaymentPackages.reduce((acc, cp) => acc + (cp.balanceRemaining || 0), 0);
  const semiPrivateRevenue = payments
    .filter((p) => p.clientPackage?.serviceType === 'SEMI_PRIVATE')
    .reduce((acc, p) => acc + (p.isRefund ? -p.amount : p.amount), 0);
  const premiumRevenue = payments
    .filter((p) => p.clientPackage?.serviceType === 'PREMIUM')
    .reduce((acc, p) => acc + (p.isRefund ? -p.amount : p.amount), 0);
  const luxuryRevenue = payments
    .filter((p) => p.clientPackage?.serviceType === 'LUXURY')
    .reduce((acc, p) => acc + (p.isRefund ? -p.amount : p.amount), 0);

  // Filtered packages based on search & tab
  const getDisplayClientPackages = () => {
    let list = clientPackages;
    if (activeTab === 'DUE_PAYMENTS') list = duePaymentPackages;
    else if (activeTab === 'PAID') list = activePaidPackages;
    else if (activeTab === 'SEMI_PRIVATE') list = semiPrivatePackages;
    else if (activeTab === 'PREMIUM') list = premiumPackages;
    else if (activeTab === 'LUXURY') list = luxuryPackages;

    const term = searchTerm.toLowerCase();
    if (!term) return list;
    return list.filter((cp) => 
      cp.client?.name?.toLowerCase().includes(term) ||
      cp.client?.clientId?.toLowerCase().includes(term) ||
      cp.client?.phone?.includes(term) ||
      cp.name?.toLowerCase().includes(term)
    );
  };

  // Filtered transactions for ALL tab
  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.client?.name?.toLowerCase().includes(term) ||
      p.client?.clientId?.toLowerCase().includes(term) ||
      p.invoiceNumber?.toLowerCase().includes(term) ||
      p.paymentMethod?.toLowerCase().includes(term)
    );
  });

  const handleOpenPaymentForClient = (pkg: any) => {
    setSelectedClientForPayment(pkg);
    const due = (pkg.balanceRemaining !== undefined && pkg.balanceRemaining > 0) ? pkg.balanceRemaining : '';
    setForm({
      clientId: pkg.clientId,
      clientPackageId: pkg.id,
      amount: String(due),
      paymentMethod: 'UPI',
      notes: `Payment for ${pkg.name} (${pkg.client?.name})`,
      isRefund: false,
    });
    setShowRecordModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.amount) {
      alert('Please select a client and specify the payment amount.');
      return;
    }

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setShowRecordModal(false);
        setForm({
          clientId: '',
          clientPackageId: '',
          amount: '',
          paymentMethod: 'UPI',
          notes: '',
          isRefund: false,
        });
        loadData();
        setReceiptModalPayment(saved);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record payment');
      }
    } catch (err) {
      alert('Error recording payment');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Billing, Payments & Due Management"
        subtitle="Manage client due balances, package expiries, category collections (Semi-Private ₹12k, Premium ₹12k, Luxury ₹46k), and official receipts"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top 5 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Due / Outstanding */}
          <div className="bg-white rounded-2xl p-4 border-2 border-rose-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider">Remaining Dues</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-rose-600 tracking-tight">
              {formatCurrency(totalOutstandingDues)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-rose-500" />
              {duePaymentPackages.length} Clients with pending balance
            </p>
          </div>

          {/* Card 2: Total Collected */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(totalCollected)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Across {payments.length} settled receipts
            </p>
          </div>

          {/* Card 3: Semi-Private (₹12,000) */}
          <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Semi-Private (₹12k)</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {semiPrivatePackages.length} <span className="text-xs font-semibold text-slate-400">Clients</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Collected: <strong className="text-purple-700 font-bold">{formatCurrency(semiPrivateRevenue)}</strong>
            </p>
          </div>

          {/* Card 4: Premium 1:1 (₹12,000) */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Premium 1:1 (₹12k)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {premiumPackages.length} <span className="text-xs font-semibold text-slate-400">Clients</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Collected: <strong className="text-amber-700 font-bold">{formatCurrency(premiumRevenue)}</strong>
            </p>
          </div>

          {/* Card 5: Luxury (₹46,000) */}
          <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Luxury (₹46k)</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {luxuryPackages.length} <span className="text-xs font-semibold text-slate-400">Clients</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Collected: <strong className="text-rose-700 font-bold">{formatCurrency(luxuryRevenue)}</strong>
            </p>
          </div>
        </div>

        {/* Action Bar: Tabs & Search & New Payment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setActiveTab('DUE_PAYMENTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'DUE_PAYMENTS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Due Payments ({duePaymentPackages.length})
            </button>

            <button
              onClick={() => setActiveTab('EXPIRING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'EXPIRING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Expiring Packages ({expiringPackages.filter(p => p.diffDays <= 15).length})
            </button>

            <button
              onClick={() => setActiveTab('SEMI_PRIVATE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'SEMI_PRIVATE'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Semi-Private (₹12k)
            </button>

            <button
              onClick={() => setActiveTab('PREMIUM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'PREMIUM'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Premium 1:1 (₹12k)
            </button>

            <button
              onClick={() => setActiveTab('LUXURY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'LUXURY'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              Luxury (₹46k)
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Invoices ({payments.length})
            </button>
          </div>

          {/* Search & Action */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search client, ID, package..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => {
                setSelectedClientForPayment(null);
                setForm({
                  clientId: allClients[0]?.id || '',
                  clientPackageId: '',
                  amount: '',
                  paymentMethod: 'UPI',
                  notes: '',
                  isRefund: false,
                });
                setShowRecordModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              + Record Payment
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading Billing & Payments Data...</p>
          </div>
        ) : activeTab === 'DUE_PAYMENTS' ? (
          /* DUE PAYMENTS & REMAINING BALANCES TABLE */
          <div className="bg-white rounded-2xl border border-rose-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-rose-950 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Clients with Remaining Due Amounts
                </h3>
                <p className="text-xs text-rose-700">Collect pending balances for active packages</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                  Total Outstanding: {formatCurrency(totalOutstandingDues)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Client ID</th>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Phone / Contact</th>
                    <th className="py-3 px-4">Package Enrolled</th>
                    <th className="py-3 px-4 text-right">Package Price</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-right">Due Balance</th>
                    <th className="py-3 px-4">Package Expiry</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {duePaymentPackages.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-slate-800">All Client Accounts are Fully Settled!</p>
                        <p className="text-slate-400 text-xs mt-0.5">Zero pending due payments at this time.</p>
                      </td>
                    </tr>
                  ) : (
                    duePaymentPackages.map((cp) => (
                      <tr key={cp.id} className="hover:bg-rose-50/20 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {cp.client?.clientId}
                        </td>
                        <td className="py-3.5 px-4">
                          <Link href={`/dashboard/clients/${cp.clientId}`} className="font-extrabold text-slate-900 hover:text-emerald-600 transition">
                            {cp.client?.name}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {cp.client?.phone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cp.serviceType === 'SEMI_PRIVATE' ? 'bg-purple-100 text-purple-700' :
                            cp.serviceType === 'PREMIUM' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {cp.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                          {formatCurrency(cp.packageAmount || (cp.serviceType === 'LUXURY' ? 46000 : 12000))}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                          {formatCurrency(cp.amountPaid || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-600 text-sm">
                          {formatCurrency(cp.balanceRemaining)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(cp.expiryDate)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenPaymentForClient(cp)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1 mx-auto"
                          >
                            <span>Collect Due</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'EXPIRING' ? (
          /* EXPIRING PACKAGES & EXPIRY TRACKER */
          <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Package Expirations & Renewal Monitor
                </h3>
                <p className="text-xs text-amber-800">Track expiring and expired client memberships</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4 text-center">Sessions Remaining</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-center">Status / Countdown</th>
                    <th className="py-3 px-4 text-right">Due Balance</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expiringPackages.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No packages recorded yet.
                      </td>
                    </tr>
                  ) : (
                    expiringPackages.map((cp) => (
                      <tr key={cp.id} className={`hover:bg-slate-50 transition ${
                        cp.expiryStatus === 'EXPIRED' ? 'bg-red-50/40' :
                        cp.expiryStatus === 'CRITICAL' ? 'bg-amber-50/30' : ''
                      }`}>
                        <td className="py-3.5 px-4">
                          <Link href={`/dashboard/clients/${cp.clientId}`} className="font-extrabold text-slate-900 hover:text-emerald-600 transition block">
                            {cp.client?.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">{cp.client?.clientId}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {cp.name}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                            cp.sessionsRemaining <= 2 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {cp.sessionsRemaining} / {cp.totalSessions} Left
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {formatDate(cp.expiryDate)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {cp.expiryStatus === 'EXPIRED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-black text-[10px] border border-red-200">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              EXPIRED ({Math.abs(cp.diffDays)} days ago)
                            </span>
                          ) : cp.expiryStatus === 'CRITICAL' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] border border-amber-200 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Expires in {cp.diffDays} days!
                            </span>
                          ) : cp.expiryStatus === 'EXPIRING_SOON' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                              {cp.diffDays} days left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                              {cp.diffDays} days left
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold">
                          {cp.balanceRemaining > 0 ? (
                            <span className="text-rose-600 font-black">{formatCurrency(cp.balanceRemaining)}</span>
                          ) : (
                            <span className="text-emerald-600 text-[11px]">Settled</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenPaymentForClient(cp)}
                            className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                          >
                            Manage / Settle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'ALL' ? (
          /* ALL INVOICES & TRANSACTIONS */
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">All Transaction Invoices & Receipts</h3>
                <p className="text-xs text-slate-400">Complete historical financial ledger</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {filteredPayments.length} Total Receipts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-right">Balance Left</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {p.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {p.client?.name || 'Walk-in Client'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-600">
                          {formatCurrency(p.balanceRemaining || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setReceiptModalPayment(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Print Invoice Receipt"
                          >
                            <Printer className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* CATEGORY FILTERED PACKAGES (SEMI_PRIVATE, PREMIUM, LUXURY, PAID) */
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {activeTab === 'SEMI_PRIVATE' ? 'Semi-Private (₹12,000) Rostered Clients' :
                   activeTab === 'PREMIUM' ? 'Premium 1:1 (₹12,000) Rostered Clients' :
                   activeTab === 'LUXURY' ? 'Luxury (₹46,000) Concierge Clients' : 'Active Settled Clients'}
                </h3>
                <p className="text-xs text-slate-400">Package memberships, remaining sessions, and dues</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Client ID</th>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-center">Sessions</th>
                    <th className="py-3 px-4 text-right">Package Cost</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Remaining Due</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getDisplayClientPackages().length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No clients found in this category.
                      </td>
                    </tr>
                  ) : (
                    getDisplayClientPackages().map((cp) => (
                      <tr key={cp.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {cp.client?.clientId}
                        </td>
                        <td className="py-3.5 px-4">
                          <Link href={`/dashboard/clients/${cp.clientId}`} className="font-extrabold text-slate-900 hover:text-emerald-600 transition">
                            {cp.client?.name}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {cp.client?.phone}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {cp.sessionsRemaining} / {cp.totalSessions}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                          {formatCurrency(cp.packageAmount || (cp.serviceType === 'LUXURY' ? 46000 : 12000))}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                          {formatCurrency(cp.amountPaid || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold">
                          {cp.balanceRemaining > 0 ? (
                            <span className="text-rose-600 font-black">{formatCurrency(cp.balanceRemaining)}</span>
                          ) : (
                            <span className="text-emerald-600">₹0 (Paid)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(cp.expiryDate)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenPaymentForClient(cp)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                          >
                            {cp.balanceRemaining > 0 ? 'Collect Due' : 'Record Payment'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Record / Collect Payment */}
        {showRecordModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">
                      {selectedClientForPayment ? `Collect Due Payment` : `Record Client Payment`}
                    </h3>
                    <p className="text-[11px] text-slate-400">Generate instant official receipt</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
                {/* Select Client */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Client *
                  </label>
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  >
                    <option value="">-- Choose Client --</option>
                    {allClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.clientId}) – {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amount Received (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 12000"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer / NEFT / IMPS</option>
                    <option value="CARD">Credit / Debit Card (POS)</option>
                    <option value="CASH">Cash Deposit</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Reference / Transaction Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref / Full payment for Semi-Private"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecordModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                  >
                    Save & Generate Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Printable Receipt */}
        {receiptModalPayment && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 font-black text-lg">
                  ✓
                </div>
                <h3 className="text-lg font-black text-slate-900">Payment Invoice Receipt</h3>
                <p className="text-xs text-slate-400">AUREX Medical Fitness & Clinical Rehab Centre</p>
              </div>

              <div className="my-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Invoice Number:</span>
                  <span className="font-mono font-bold text-slate-900">{receiptModalPayment.invoiceNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Client Name:</span>
                  <span className="font-bold text-slate-900">{receiptModalPayment.client?.name || 'Valued Client'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(receiptModalPayment.amount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-semibold text-slate-700">{receiptModalPayment.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Payment Date:</span>
                  <span className="font-medium text-slate-700">{formatDate(receiptModalPayment.paymentDate)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Remaining Balance:</span>
                  <span className="font-bold text-rose-600">{formatCurrency(receiptModalPayment.balanceRemaining || 0)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
                <button
                  onClick={() => setReceiptModalPayment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
