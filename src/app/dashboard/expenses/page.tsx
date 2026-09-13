'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  PlusCircle, 
  Search, 
  FileSpreadsheet, 
  Calendar, 
  Trash2, 
  X, 
  Check, 
  TrendingDown, 
  Tag
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'OPERATIONAL',
    date: new Date().toISOString().split('T')[0],
  });

  async function loadExpenses() {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses');
      if (res.status === 403) {
        setExpenses([]);
        return;
      }
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowAddModal(false);
        setForm({
          description: '',
          amount: '',
          category: 'OPERATIONAL',
          date: new Date().toISOString().split('T')[0],
        });
        loadExpenses();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save expense');
      }
    } catch (err) {
      alert('Error saving expense');
    }
  };

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filtered.reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Clinical & Operational Expenses</h1>
          <p className="text-xs text-slate-500">Log clinic overheads, equipment maintenance, and facility costs</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1e3a8a] text-white p-3 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 items-center text-xs">
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none"
            >
              <option value="ALL" className="text-slate-900">—All Categories—</option>
              <option value="OPERATIONAL" className="text-slate-900">Operational Overheads</option>
              <option value="EQUIPMENT" className="text-slate-900">Clinical Equipment</option>
              <option value="SALARIES" className="text-slate-900">Specialist / Staff Salaries</option>
              <option value="MAINTENANCE" className="text-slate-900">Facility Maintenance</option>
              <option value="UTILITIES" className="text-slate-900">Utilities & Electricity</option>
            </select>
          </div>

          <div className="md:col-span-3 relative">
            <input
              type="text"
              placeholder="Search description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded pl-7 pr-2.5 py-1 text-white placeholder-slate-300 text-xs outline-none focus:bg-white/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-2 top-1.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1e40af] text-white font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Loading expenses...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">No expenses recorded yet.</td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                    <td className="py-3 px-3 font-medium text-slate-700">{formatDate(item.date)}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{item.description}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-600">{formatCurrency(item.amount)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 font-bold">
          <span>Total Expenses Logged: {filtered.length} entries</span>
          <span>Sum: <span className="font-mono text-rose-600">{formatCurrency(totalAmount)}</span></span>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Log New Clinic Expense
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. McGill Torpedo Rollers & Therapy Bands"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="OPERATIONAL">Operational Overheads</option>
                    <option value="EQUIPMENT">Clinical Equipment</option>
                    <option value="SALARIES">Specialist / Staff Salaries</option>
                    <option value="MAINTENANCE">Facility Maintenance</option>
                    <option value="UTILITIES">Utilities & Electricity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
