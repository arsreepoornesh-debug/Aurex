'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Award, 
  CreditCard, 
  FileHeart, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  PhoneCall,
  ChevronRight
} from 'lucide-react';

export default function ClientPortalHome() {
  const [clientData, setClientData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClientData() {
      try {
        // Fetch Puneesh's record (AUR-2026-0001) for client portal view
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
    loadClientData();
  }, []);

  const activePackage = clientData?.packages?.[0] || {
    name: 'Semi-Private Clinical Package (12 Sessions)',
    totalSessions: 12,
    sessionsRemaining: 11,
    sessionsUsed: 1,
    expiryDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
  };

  const remainingPercent = Math.round(
    ((activePackage.sessionsRemaining || 11) / (activePackage.totalSessions || 12)) * 100
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Rehab & Medical Fitness Member</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Good morning, {clientData?.name || 'Puneesh'}! 👋
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Welcome to your AUREX clinical fitness portal. Track your session credits, upcoming appointments, and recovery progress.
          </p>
        </div>
      </div>

      {/* Grid: Active Membership Card & Upcoming Appointment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Active Membership Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Membership</h3>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Active</span>
              </div>
            </div>
            <Link
              href="/portal/membership"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-1.5">
            <p className="text-base font-extrabold text-slate-900">{activePackage.name}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Sessions Remaining</span>
              <span className="font-bold text-slate-900 text-sm">
                {activePackage.sessionsRemaining} / {activePackage.totalSessions}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Valid Until:</span>
            <span className="font-semibold text-slate-800">
              {new Date(activePackage.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Card 2: Upcoming Clinical Session */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Next Appointment</h3>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Confirmed</span>
              </div>
            </div>
            <Link
              href="/portal/appointments"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Semi-Private Clinical Session</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                08:00 AM – 09:00 AM
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Assigned Specialist: <strong>Dr. Raghav Mehta</strong> (Spine & Biomechanics)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/portal/book"
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition text-center shadow-sm"
            >
              Book Another Session
            </Link>
            <Link
              href="/portal/contact"
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Reschedule
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/portal/book"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition text-center space-y-2 group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">Book Session</span>
        </Link>

        <Link
          href="/portal/payments"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition text-center space-y-2 group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">Invoices & Bills</span>
        </Link>

        <Link
          href="/portal/assessment"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition text-center space-y-2 group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileHeart className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">My Assessment</span>
        </Link>

        <Link
          href="/portal/contact"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition text-center space-y-2 group"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">Contact Desk</span>
        </Link>
      </div>

      {/* Notifications Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 space-y-0.5">
          <p className="font-bold">Medical Clearance Active</p>
          <p className="text-emerald-700">
            Your McGill Big 3 prescription is registered. Please ensure 10-minute warm-up prior to your scheduled session.
          </p>
        </div>
      </div>
    </div>
  );
}
