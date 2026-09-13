'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  FileSpreadsheet, 
  Mail, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard,
  User,
  Calendar,
  DollarSign,
  X,
  CheckCircle2,
  Check
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLimit, setShowLimit] = useState(10);
  const [clientFilter, setClientFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  const [form, setForm] = useState({
    clientId: '',
    amount: '',
    paymentMethod: 'UPI',
    notes: '',
    isRefund: false,
  });

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/clients'),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      setPayments(Array.isArray(pData) ? pData : []);
      setClients(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPayments(filteredPayments.map((p) => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedPayments.includes(id)) {
      setSelectedPayments(selectedPayments.filter((i) => i !== id));
    } else {
      setSelectedPayments([...selectedPayments, id]);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setShowRecordModal(false);
        setForm({
          clientId: '',
          amount: '',
          paymentMethod: 'UPI',
          notes: '',
          isRefund: false,
        });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record payment');
      }
    } catch (err) {
      alert('Error recording payment');
    }
  };

  // Filtering
  const filteredPayments = payments.filter((p) => {
    const clientName = p.client?.name || '';
    const matchesSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client?.phone && p.client.phone.includes(searchTerm));
    const matchesClient = clientFilter === 'ALL' || p.clientId === clientFilter;
    return matchesSearch && matchesClient;
  });

  const totalAmount = filteredPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalPages = Math.ceil(filteredPayments.length / showLimit) || 1;
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * showLimit, currentPage * showLimit);

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Billing & Payments Ledger</h1>
          <p className="text-xs text-slate-500">Track client collections, invoice generation, and pending balances</p>
        </div>

        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Record Payment</span>
        </button>
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

          {/* All Clients dropdown */}
          <div className="lg:col-span-2">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20 truncate"
            >
              <option value="ALL" className="text-slate-900">—All Clients—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-900">
                  {c.name} ({c.clientId})
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">— Date range —</option>
              <option value="TODAY" className="text-slate-900">Today</option>
              <option value="THIS_MONTH" className="text-slate-900">This Month</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search Invoice #, Client Name, Contact..."
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
            onClick={() => alert(`Broadcasting Payment Reminder SMS`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📢 BULK SMS</span>
          </button>

          <button
            onClick={() => alert(`Broadcasting Payment Receipts via WhatsApp`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📱 BULK WHATSAPP</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button
            onClick={() => alert(`Emailing Invoices to clients`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0f766e] hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>✉ BULK EMAIL</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Payment Ledger to Excel...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel export</span>
          </button>
        </div>
      </div>

      {/* 3. TABLE (Blue Header #1e40af) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1e40af] text-white font-bold uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-10"># ↕</th>
                <th className="py-2.5 px-3">Date ↕</th>
                <th className="py-2.5 px-3">Name ↕</th>
                <th className="py-2.5 px-3">Contact No.</th>
                <th className="py-2.5 px-2 text-center">Photo</th>
                <th className="py-2.5 px-3">Amount ↕</th>
                <th className="py-2.5 px-3">For (Package / Invoice)</th>
                <th className="py-2.5 px-3">Rep.</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p, idx) => {
                  const globalIdx = (currentPage - 1) * showLimit + idx + 1;
                  const isSelected = selectedPayments.includes(p.id);
                  const client = p.client || {};
                  const dateStr = new Date(p.paymentDate).toLocaleDateString('en-GB');

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(p.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-500 font-semibold">{globalIdx}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">{dateStr}</td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="font-bold text-[#3b82f6] hover:underline hover:text-blue-700"
                        >
                          {client.name || 'Client'}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono block">{client.clientId}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{client.phone || '—'}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center mx-auto text-xs">
                          {(client.name || 'C')[0]}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {p.isRefund ? (
                          <span className="text-rose-600 font-mono">- {formatCurrency(p.amount)}</span>
                        ) : (
                          <span className="text-slate-900 font-mono">{formatCurrency(p.amount)}</span>
                        )}
                        <span className="text-[10px] text-slate-400 block font-normal">{p.paymentMethod}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">
                          {p.clientPackage?.name || 'Semi-Private: 12 sessions'}
                        </span>
                        <span className="text-[10px] text-amber-700 font-mono block font-bold">{p.invoiceNumber}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">Admin</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Action Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveActionMenu(activeActionMenu === p.id ? null : p.id)}
                              className="px-2 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                            >
                              <span>⚙ Action</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {activeActionMenu === p.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left">
                                <Link
                                  href={`/dashboard/clients/${client.id}`}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium block"
                                >
                                  View 360° Profile
                                </Link>
                                <button
                                  onClick={() => {
                                    setActiveActionMenu(null);
                                    alert(`Invoice ${p.invoiceNumber} receipt downloaded!`);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium block text-left"
                                >
                                  Print Invoice
                                </button>
                              </div>
                            )}
                          </div>

                          {/* WhatsApp */}
                          {client.phone && (
                            <a
                              href={`https://wa.me/91${client.phone.replace(/\D/g, '')}?text=Dear%20${encodeURIComponent(
                                client.name
                              )},%20here%20is%20your%20AUREX%20receipt%20for%20${encodeURIComponent(
                                formatCurrency(p.amount)
                              )}%20(Invoice:%20${p.invoiceNumber})`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition shadow-sm"
                              title="Send receipt on WhatsApp"
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

        {/* 4. FOOTER WITH TOTAL & PAGINATION */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * showLimit + (filteredPayments.length ? 1 : 0)}</span> to{' '}
              <span className="font-bold text-slate-800">{Math.min(currentPage * showLimit, filteredPayments.length)}</span> of{' '}
              <span className="font-bold text-slate-800">{filteredPayments.length}</span> entries
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-900">
              Total: <span className="font-mono text-emerald-700">{formatCurrency(totalAmount)}</span>
            </span>
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

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Record Client Payment
              </span>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Client *</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-medium"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.clientId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="24000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reference / Transaction Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Ref / Cheque No"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="refundCheck"
                  checked={form.isRefund}
                  onChange={(e) => setForm({ ...form, isRefund: e.target.checked })}
                  className="rounded border-slate-300 text-rose-600 focus:ring-0"
                />
                <label htmlFor="refundCheck" className="text-xs font-semibold text-rose-700">
                  Mark as Refund Transaction
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow transition"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
