'use client';

import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Calendar, 
  IndianRupee, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Coffee,
  Car,
  FileText,
  PackageCheck
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  createdAt: string;
}

export function ReceptionistExpensesWidget() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form inputs
  const todayStr = new Date().toISOString().split('T')[0];
  const [spentOn, setSpentOn] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayStr);
  const [category, setCategory] = useState('FOOD');

  const quickPresets = [
    { label: '🍔 Food & Meals', category: 'FOOD', example: 'Staff lunch / meals for company sake' },
    { label: '🚕 Travel & Cab', category: 'TRAVEL', example: 'Auto / cab travel for company errands' },
    { label: '🏢 Office Supplies', category: 'OFFICE_SUPPLIES', example: 'Stationery, print paper & desk supplies' },
    { label: '📦 Courier', category: 'COURIER', example: 'Courier charges & package dispatch' },
  ];

  async function fetchExpenses() {
    try {
      setLoading(true);
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!spentOn.trim() || !amount) {
      setMessage({ type: 'error', text: 'Please fill what was spent on and the amount' });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive amount' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: spentOn.trim(),
          amount: numAmount,
          date: expenseDate,
          category,
        }),
      });

      if (res.ok) {
        const newExpense = await res.json();
        setExpenses((prev) => [newExpense, ...prev]);
        setSpentOn('');
        setAmount('');
        setExpenseDate(todayStr);
        setMessage({ type: 'success', text: `Saved ₹${numAmount.toLocaleString()} for "${newExpense.description}"` });
        setTimeout(() => setMessage(null), 4000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to save expense' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error saving expense' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteExpense(id: string) {
    if (!confirm('Are you sure you want to remove this expense record?')) return;

    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses((prev) => prev.filter((item) => item.id !== id));
        setMessage({ type: 'success', text: 'Expense record deleted' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete expense' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error deleting expense' });
    }
  }

  // Calculate metrics
  const todayExpenses = expenses.filter((e) => {
    const expDate = new Date(e.date).toISOString().split('T')[0];
    return expDate === todayStr;
  });

  const totalSpentToday = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalAllTime = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  function renderCategoryBadge(cat: string) {
    switch (cat) {
      case 'FOOD':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">🍔 Food & Meals</span>;
      case 'TRAVEL':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">🚕 Travel & Cab</span>;
      case 'OFFICE_SUPPLIES':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">🏢 Office Supplies</span>;
      case 'COURIER':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">📦 Courier</span>;
      case 'CLEANING':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">🧹 Cleaning</span>;
      case 'MAINTENANCE':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">🔧 Maintenance</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">🏷️ {cat.replace('_', ' ')}</span>;
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in-50">
      {/* Header Banner */}
      <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-950/40">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Reception Daily Expenses & Company Out-of-Pocket
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Front Desk Quick Manage
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Log expenditures made for company sake (Food, Travel, Logistics, Supplies) with exact amount and date
            </p>
          </div>
        </div>

        {/* Live Metrics Chips */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Today's Spend</div>
              <div className="text-sm font-extrabold text-emerald-400 font-mono">
                {formatCurrency(totalSpentToday)}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Logged</div>
            <div className="text-sm font-extrabold text-white font-mono">
              {formatCurrency(totalAllTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content Grid: Left Form + Right Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Left Column: Add Expense Form (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-slate-50/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 font-bold" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Add Company Expense
              </h4>
            </div>
          </div>

          {/* Quick Preset Buttons (Food, Travel, etc.) */}
          <div className="mb-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Quick Select (Company Sake):
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {quickPresets.map((preset) => (
                <button
                  key={preset.category}
                  type="button"
                  onClick={() => {
                    setCategory(preset.category);
                    if (!spentOn) setSpentOn(preset.example);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-left transition border flex items-center justify-between ${
                    category === preset.category
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-3.5">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
              >
                <option value="FOOD">🍔 Food & Refreshments (Staff Meals, Client Snacks, Company Sake)</option>
                <option value="TRAVEL">🚕 Travel & Conveyance (Cab, Auto, Fuel, Company Errands)</option>
                <option value="OFFICE_SUPPLIES">🏢 Office & Front Desk Supplies (Stationery, Paper)</option>
                <option value="COURIER">📦 Courier, Postage & Document Dispatch</option>
                <option value="CLEANING">🧹 Cleaning, Towels & Sanitization Materials</option>
                <option value="MAINTENANCE">🔧 Clinic Repairs & Petty Maintenance</option>
                <option value="OTHER">🏷️ Other Company Official Out-of-Pocket</option>
              </select>
            </div>

            {/* Spent On (Description) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Spent On (Purpose / Item) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={spentOn}
                onChange={(e) => setSpentOn(e.target.value)}
                placeholder="e.g. Staff lunch for meeting, cab travel for pickup, drinking water"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
              />
            </div>

            {/* Amount Spent + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount Spent (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Expense <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Recording Expense...' : 'Save Expense'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Recent Expenses Ledger (7 cols) */}
        <div className="lg:col-span-7 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Logged Expenses Ledger
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                {expenses.length} Records
              </span>
            </div>

            {/* Expenses Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Spent On (Purpose)</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Loading expenses...
                        </td>
                      </tr>
                    ) : expenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                          No company expenses recorded yet. Use the form on the left to add Food, Travel, or Supplies.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                            {formatDate(item.date)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {renderCategoryBadge(item.category)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Expenses are recorded directly to clinic operations ledger.</span>
            <span className="font-semibold text-slate-700">
              Today: {todayExpenses.length} entries ({formatCurrency(totalSpentToday)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
