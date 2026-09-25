'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Calendar, CheckCircle2, ChevronLeft, RefreshCw } from 'lucide-react';

export default function MembershipPage() {
  const [clientData, setClientData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClient() {
      try {
        const res = await fetch('/api/clients/AUR-2026-0001');
        if (res.ok) {
          const data = await res.json();
          setClientData(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, []);

  const pkg = clientData?.packages?.[0] || {
    name: 'Semi-Private Clinical Package (12 Sessions)',
    serviceType: 'SEMI_PRIVATE',
    totalSessions: 12,
    sessionsUsed: 1,
    sessionsRemaining: 11,
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
  };

  const percentUsed = Math.round(((pkg.sessionsUsed || 1) / (pkg.totalSessions || 12)) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/portal" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900">My Clinical Membership</h1>
          <p className="text-xs text-slate-500">Package credits, validity, and renewal status</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Package</span>
              <h2 className="text-lg font-extrabold text-slate-900">{pkg.name}</h2>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 rounded-full text-xs font-bold self-start">
            {pkg.status}
          </span>
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Purchased</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{pkg.totalSessions}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Completed</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{pkg.sessionsUsed}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <span className="text-xs text-emerald-700 font-bold">Remaining</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{pkg.sessionsRemaining}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Utilization Progress</span>
            <span>{percentUsed}% completed</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentUsed}%` }} />
          </div>
        </div>

        {/* Validity */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500">Start Date:</span>
            <p className="font-bold text-slate-800 mt-0.5">
              {new Date(pkg.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Expiry Date:</span>
            <p className="font-bold text-slate-800 mt-0.5">
              {new Date(pkg.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
