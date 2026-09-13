'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FileHeart, 
  Stethoscope, 
  HeartPulse, 
  Activity, 
  ArrowLeft, 
  Printer, 
  Calendar, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AssessmentDetailPage() {
  const params = useParams();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/assessments`);
      const data = await res.json();
      const match = data.find((a: any) => a.id === params.id);
      setAssessment(match || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [params.id]);

  if (loading || !assessment) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading clinical evaluation record...
      </div>
    );
  }

  const hs = (() => {
    try {
      return JSON.parse(assessment.healthScreening);
    } catch {
      return {};
    }
  })();
  const mh = (() => {
    try {
      return JSON.parse(assessment.medicalHistory);
    } catch {
      return {};
    }
  })();
  const g = (() => {
    try {
      return JSON.parse(assessment.goals);
    } catch {
      return {};
    }
  })();
  const bm = (() => {
    try {
      return JSON.parse(assessment.baselineMetrics);
    } catch {
      return {};
    }
  })();
  const fm = (() => {
    try {
      return JSON.parse(assessment.functionalMovement);
    } catch {
      return {};
    }
  })();
  const cn = (() => {
    try {
      return JSON.parse(assessment.clinicalNotes);
    } catch {
      return {};
    }
  })();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5 print:p-0">
      {/* Top Header Controls (Hidden on Print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/assessments"
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Forms & Assessments</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Official Clinical Report Paper */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6 print:border-none print:shadow-none">
        {/* Letterhead */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-slate-900 text-emerald-400 font-black flex items-center justify-center text-sm">
                A
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AUREX CLINICAL EXERCISE</h1>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
              Medical Fitness & Active Rehabilitation Center
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="font-bold text-slate-800 block">CONFIDENTIAL CLINICAL REPORT</span>
            <span className="text-slate-500 font-mono text-[11px]">Evaluation ID: {assessment.id.slice(0, 10)}</span>
          </div>
        </div>

        {/* Client & Specialist Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Patient / Client</span>
            <span className="font-bold text-slate-900">{assessment.client?.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">AUREX ID</span>
            <span className="font-mono font-bold text-emerald-700">{assessment.client?.clientId}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Evaluation Date</span>
            <span className="font-semibold text-slate-800">{formatDate(assessment.date)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Evaluating Specialist</span>
            <span className="font-semibold text-slate-800">{assessment.specialist?.name || 'Physiologist'}</span>
          </div>
        </div>

        {/* Section 1: Pre-Exercise Screening & Flags */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] border-b pb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            1. Pre-Exercise Screening & Medical Flags
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <span className="text-slate-500 font-semibold block">Known Conditions:</span>
              <span className="text-slate-900 font-bold">{hs.medicalConditions?.join(', ') || 'None noted'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Red Flags & Precautions:</span>
              <span className="text-rose-700 font-medium">{hs.redFlags?.join(', ') || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Baseline Vitals */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] border-b pb-1 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            2. Baseline Vitals & Anthropometrics
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs pt-1">
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Height</span>
              <span className="font-bold text-slate-900 font-mono">{bm.heightCm || '—'} cm</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Weight</span>
              <span className="font-bold text-slate-900 font-mono">{bm.weightKg || '—'} kg</span>
            </div>
            <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 block font-bold">BMI</span>
              <span className="font-bold text-emerald-900 font-mono">{bm.bmi || '—'}</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Resting HR</span>
              <span className="font-bold text-slate-900 font-mono">{bm.restingHeartRate || '—'} bpm</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
              <span className="font-bold text-slate-900 font-mono">
                {bm.bloodPressureSystolic || '—'}/{bm.bloodPressureDiastolic || '—'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Body Fat %</span>
              <span className="font-bold text-slate-900 font-mono">{bm.bodyFatPercent || '—'} %</span>
            </div>
          </div>
        </div>

        {/* Section 3: Functional Movement & McGill Big 3 */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] border-b pb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            3. Movement & Lumbar Spine Stability Grading
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Overhead Squat</span>
              <span className="font-bold text-slate-900">Score: {fm.overheadSquatScore || '2'} / 3</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Hurdle Step</span>
              <span className="font-bold text-slate-900">Score: {fm.hurdleStepScore || '2'} / 3</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">McGill Bird-Dog</span>
              <span className="font-bold text-slate-900">Score: {fm.birdDogScore || '2'} / 3</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Side Plank Hold</span>
              <span className="font-bold text-slate-900 font-mono">{fm.sidePlankHoldSec || '45'} sec</span>
            </div>
          </div>
          {fm.postureNotes && (
            <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 mt-2">
              <span className="font-bold">Postural Alignment:</span> {fm.postureNotes}
            </p>
          )}
        </div>

        {/* Section 4: Clinical Prescription Protocol */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] border-b pb-1 flex items-center gap-1.5">
            <FileHeart className="w-3.5 h-3.5 text-emerald-600" />
            4. Specialist Clinical Findings & Exercise Prescription
          </h2>
          <div className="space-y-3 text-xs pt-1">
            <div className="p-3 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Biomechanical Findings</span>
              <p className="text-slate-900 font-medium mt-0.5">{cn.findings || 'No notes'}</p>
            </div>

            <div className="p-3 rounded bg-emerald-50 border border-emerald-300">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                Prescribed Exercise Protocol
              </span>
              <p className="text-emerald-950 font-bold mt-0.5">{cn.exercisePrescription || 'Protocol assigned'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-700 uppercase font-bold block">Contraindications</span>
                <p className="text-rose-950 font-medium mt-0.5">{cn.contraindications || 'None'}</p>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Next Review Date</span>
                <p className="text-slate-900 font-medium mt-0.5">{cn.nextReviewDate || '6 Weeks'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Box */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            <span className="text-[10px] text-slate-400 block">Verified Clinical Specialist</span>
            <span className="font-bold text-slate-800">{assessment.specialist?.name || 'Physiologist'}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Authorized Signature</span>
            <span className="font-serif italic font-bold text-slate-800">AUREX Medical Board</span>
          </div>
        </div>
      </div>
    </div>
  );
}
