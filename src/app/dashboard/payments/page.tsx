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
  Filter
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Header } from '@/components/layout/Header';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab view: 'ALL' | 'PAID' | 'YET_TO_PAY' | 'PRIVATE' | 'SEMI_PRIVATE'
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAID' | 'YET_TO_PAY' | 'PRIVATE' | 'SEMI_PRIVATE'>('ALL');
  
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

  // Compute Active Paid Clients vs Yet to Pay Clients
  const activePaidPackages = clientPackages.filter((cp) => (cp.balanceRemaining || 0) <= 0);
  const yetToPayPackages = clientPackages.filter((cp) => (cp.balanceRemaining || 0) > 0);
  const privatePackages = clientPackages.filter((cp) => cp.serviceType === 'PREMIUM');
  const semiPrivatePackages = clientPackages.filter((cp) => cp.serviceType === 'SEMI_PRIVATE');

  // Compute Total Metrics
  const totalCollected = payments.reduce((acc, p) => acc + (p.isRefund ? -p.amount : p.amount), 0);
  const totalOutstanding = yetToPayPackages.reduce((acc, cp) => acc + (cp.balanceRemaining || 0), 0);
  const privateRevenue = payments
    .filter((p) => p.clientPackage?.serviceType === 'PREMIUM')
    .reduce((acc, p) => acc + (p.isRefund ? -p.amount : p.amount), 0);
  const semiPrivateRevenue = payments
    .filter((p) => p.clientPackage?.serviceType === 'SEMI_PRIVATE')
    .reduce((acc, p) => acc + (p.isRefund ? -p.amount : p.amount), 0);

  // Filtered packages based on search
  const filteredClientPackages = clientPackages.filter((cp) => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      cp.client?.name?.toLowerCase().includes(term) ||
      cp.client?.clientId?.toLowerCase().includes(term) ||
      cp.client?.phone?.includes(term) ||
      cp.name?.toLowerCase().includes(term);

    if (!matchSearch) return false;

    if (activeTab === 'PAID') return (cp.balanceRemaining || 0) <= 0;
    if (activeTab === 'YET_TO_PAY') return (cp.balanceRemaining || 0) > 0;
    if (activeTab === 'PRIVATE') return cp.serviceType === 'PREMIUM';
    if (activeTab === 'SEMI_PRIVATE') return cp.serviceType === 'SEMI_PRIVATE';
    return true;
  });

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
    setForm({
      clientId: pkg.clientId,
      clientPackageId: pkg.id,
      amount: String(pkg.balanceRemaining > 0 ? pkg.balanceRemaining : ''),
      paymentMethod: 'UPI',
      notes: `Payment for ${pkg.name}`,
      isRefund: false,
    });
    setShowRecordModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.amount) {
      alert('Please select a client and specify the amount.');
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
        title="Billing & Payments Center"
        subtitle="Manage client invoices, active paid accounts, pending balances, and private vs semi-private collections"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top 4 Summary Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Total Collected */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Collection</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                ₹
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalCollected)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {activePaidPackages.length} Fully Paid Client Packages
            </p>
          </div>

          {/* Card 2: Yet to Pay / Outstanding */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yet to Pay / Due</span>
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              {yetToPayPackages.length} Clients with pending balance
            </p>
          </div>

          {/* Card 3: Private Session Clients (1:1) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Private Clients (1:1)</span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {privatePackages.length} <span className="text-xs font-semibold text-slate-400">Clients</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Collected: <strong className="text-emerald-600">{formatCurrency(privateRevenue)}</strong>
            </p>
          </div>

          {/* Card 4: Semi-Private Clients (1:4) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Semi-Private (1:4)</span>
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {semiPrivatePackages.length} <span className="text-xs font-semibold text-slate-400">Clients</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Collected: <strong className="text-emerald-600">{formatCurrency(semiPrivateRevenue)}</strong>
            </p>
          </div>
        </div>

        {/* Action Bar: Tabs & Search & New Payment */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Invoices ({payments.length})
            </button>

            <button
              onClick={() => setActiveTab('PAID')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'PAID'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Paid Clients ({activePaidPackages.length})
            </button>

            <button
              onClick={() => setActiveTab('YET_TO_PAY')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'YET_TO_PAY'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Clients Yet to Pay ({yetToPayPackages.length})
            </button>

            <button
              onClick={() => setActiveTab('PRIVATE')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'PRIVATE'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Private 1:1 ({privatePackages.length})
            </button>

            <button
              onClick={() => setActiveTab('SEMI_PRIVATE')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'SEMI_PRIVATE'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Semi-Private 1:4 ({semiPrivatePackages.length})
            </button>
          </div>

          {/* Search & Action */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search client, ID, invoice..."
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
              + Log Payment
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading Billing & Payments Data...</p>
          </div>
        ) : activeTab === 'ALL' ? (
          /* ALL Invoices / Transactions Ledger Table */
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
                  <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Session / Package Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No payment records found. Click <strong>+ Log Payment</strong> to record an invoice.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {payment.invoiceNumber || 'INV-PENDING'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/dashboard/clients/${payment.client?.id}`}
                            className="font-bold text-slate-900 hover:text-emerald-600 transition flex items-center gap-1.5"
                          >
                            <span>{payment.client?.name || 'Walk-in Client'}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({payment.client?.clientId || 'AUR'})
                            </span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            payment.clientPackage?.serviceType === 'PREMIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : payment.clientPackage?.serviceType === 'SEMI_PRIVATE'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {payment.clientPackage?.serviceType === 'PREMIUM' ? 'Private 1:1' : 'Semi-Private 1:4'} • {payment.clientPackage?.name || 'General Session'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          {payment.isRefund ? (
                            <span className="text-rose-600">- {formatCurrency(payment.amount)} (Refund)</span>
                          ) : (
                            <span className="text-emerald-600">+ {formatCurrency(payment.amount)}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            payment.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700'
                              : payment.status === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {payment.status === 'PAID' ? '✓ FULLY PAID' : payment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setReceiptModalPayment(payment)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
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
          /* Tabbed Client Billing Cards & Tables (Active Paid / Yet to Pay / Private / Semi-Private) */
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {activeTab === 'PAID' && 'Active Fully Paid Clients (0 Balance Due)'}
                  {activeTab === 'YET_TO_PAY' && 'Clients Yet to Pay (Outstanding Balance Due)'}
                  {activeTab === 'PRIVATE' && 'Private Session Clients (1:1 Medical Fitness)'}
                  {activeTab === 'SEMI_PRIVATE' && 'Semi-Private Session Clients (1:4 Clinical Rehab)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeTab === 'PAID' && 'Clients who have cleared all session package invoices'}
                  {activeTab === 'YET_TO_PAY' && 'Clients with pending balance requiring payment collection'}
                  {activeTab === 'PRIVATE' && '1:1 Private coaching clients and their financial status'}
                  {activeTab === 'SEMI_PRIVATE' && '1:4 Semi-Private group clients and their financial status'}
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {filteredClientPackages.length} Enrolled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Enrolled Package</th>
                    <th className="py-3 px-4">Service Type</th>
                    <th className="py-3 px-4">Sessions Balance</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClientPackages.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No clients found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredClientPackages.map((pkg) => {
                      const isFullyPaid = (pkg.balanceRemaining || 0) <= 0;
                      return (
                        <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/dashboard/clients/${pkg.client?.id}`}
                              className="font-bold text-slate-900 hover:text-emerald-600 transition block"
                            >
                              {pkg.client?.name}
                            </Link>
                            <span className="text-[10px] font-mono text-slate-400">
                              {pkg.client?.clientId} • {pkg.client?.phone}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {pkg.name}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              pkg.serviceType === 'PREMIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {pkg.serviceType === 'PREMIUM' ? 'Private 1:1' : 'Semi-Private 1:4'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900">
                              {pkg.sessionsRemaining} / {pkg.totalSessions}
                            </span>
                            <span className="text-[10px] text-slate-400 block">sessions left</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">
                            {formatCurrency(pkg.pricePaid || 0)}
                          </td>
                          <td className="py-3.5 px-4">
                            {isFullyPaid ? (
                              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                ₹0 (Nil)
                              </span>
                            ) : (
                              <span className="text-rose-600 font-black text-sm">
                                {formatCurrency(pkg.balanceRemaining)}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              isFullyPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-700 animate-pulse'
                            }`}>
                              {isFullyPaid ? '✓ FULLY PAID' : '⚠ PENDING PAYMENT'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenPaymentForClient(pkg)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                                isFullyPaid
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-rose-600 hover:bg-rose-500 text-white'
                              }`}
                            >
                              {isFullyPaid ? '+ Add Bill' : 'Collect Due'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Record Payment */}
        {showRecordModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Record Payment Invoice</h3>
                    <p className="text-xs text-slate-400">Log incoming client collection & update session balance</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
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
                        {c.name} ({c.clientId}) — {c.phone}
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
                      placeholder="e.g. 24000"
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
                    placeholder="e.g. UPI Ref: 4892749219 / 12-session Semi-Private"
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
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
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
                  <span className="text-slate-400">Balance Remaining:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(receiptModalPayment.balanceRemaining || 0)}</span>
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
