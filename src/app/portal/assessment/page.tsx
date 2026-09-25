'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileHeart, ChevronLeft, CheckCircle2, ShieldCheck, Activity, Target } from 'lucide-react';

export default function ClientAssessmentPage() {
  const [assessment, setAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessment() {
      try {
        const res = await fetch('/api/clients/AUR-2026-0001');
        if (res.ok) {
          const data = await res.json();
          setAssessment(data.assessments?.[0] || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/portal" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900">My Progress & Clinical Goals</h1>
        <p className="text-xs text-slate-500">Summary of your rehabilitation goals, vitals, and prescribed exercise protocols</p>
      </div>

      {/* Clinical Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileHeart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Initial Clinical Assessment</span>
              <h2 className="text-sm font-bold text-slate-900">Rehabilitation & Biomechanics Summary</h2>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">Assigned: Dr. Raghav Mehta</span>
        </div>

        {/* Primary Goals */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Target className="w-4 h-4 text-emerald-600" />
            Primary Clinical Objectives
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {assessment?.goals || 'Core stabilization, pain-free posture & return to recreational sports (Swimming, Badminton)'}
          </p>
        </div>

        {/* Baseline Vitals */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Registered Baseline Vitals
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500">Resting HR</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">72 bpm</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500">Blood Pressure</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">122 / 78</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500">Body Mass Index</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">25.9</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500">SpO2 Oxygen</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">99%</p>
            </div>
          </div>
        </div>

        {/* Prescription Protocol */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Specialist Prescription Notes
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Prescribed <strong>McGill Big 3</strong> protocol (Modified Curl-Up, Side Bridge, Bird-Dog) with neutral spine focus. Avoid loaded spinal flexion.
          </p>
        </div>
      </div>
    </div>
  );
}
