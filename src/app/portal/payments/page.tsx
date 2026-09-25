'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, FileText, ChevronLeft, CheckCircle2, Download } from 'lucide-react';

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch('/api/clients/AUR-2026-0001');
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/portal" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900">Payments & Invoices</h1>
        <p className="text-xs text-slate-500">Official tax invoices and payment history receipts</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading billing records...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No billing records found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {p.invoiceNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(p.paymentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {p.clientPackage?.name || 'Semi-Private Clinical Package (12 Sessions)'}
                    </p>
                    <p className="text-xs text-slate-500">Method: {p.paymentMethod} • Status: {p.status}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-slate-900">
                    ₹{p.amountPaid?.toLocaleString('en-IN') || p.amount?.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Print Receipt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
