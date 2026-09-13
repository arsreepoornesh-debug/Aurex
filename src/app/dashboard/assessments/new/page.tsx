'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FileHeart, 
  Stethoscope, 
  HeartPulse, 
  Activity, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Save,
  Clock,
  User,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';

export default function NewAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId') || '';
  const initialType = searchParams.get('type') || 'INITIAL';

  const [clients, setClients] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [clientId, setClientId] = useState(preselectedClientId);
  const [specialistId, setSpecialistId] = useState('');
  const [type, setType] = useState(initialType);

  // Section 1: Health Screening
  const [parQAnswer, setParQAnswer] = useState<'YES' | 'NO'>('NO');
  const [medicalConditions, setMedicalConditions] = useState('L4-L5 Lumbar Disc Bulge, Mild Postural Kyphosis');
  const [redFlags, setRedFlags] = useState('No acute numbness or radiating lower-limb pain');
  const [physicianClearanceRequired, setPhysicianClearanceRequired] = useState(false);
  const [physicianClearanceObtained, setPhysicianClearanceObtained] = useState(true);

  // Section 2: Medical History
  const [surgeries, setSurgeries] = useState('None');
  const [injuries, setInjuries] = useState('Low back strain during deadlift 6 months ago');
  const [currentMedications, setCurrentMedications] = useState('None');
  const [painAreas, setPainAreas] = useState('Lower Back (Lumbosacral)');

  // Section 3: Goals
  const [primaryGoal, setPrimaryGoal] = useState('Core stabilization, pain-free posture & return to recreational sports');
  const [timelineWeeks, setTimelineWeeks] = useState(12);
  const [sportsOrActivities, setSportsOrActivities] = useState('Swimming, Badminton');

  // Section 4: Baseline Metrics
  const [heightCm, setHeightCm] = useState(178);
  const [weightKg, setWeightKg] = useState(82);
  const [restingHeartRate, setRestingHeartRate] = useState(72);
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState(120);
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState(80);
  const [bodyFatPercent, setBodyFatPercent] = useState(21.5);
  const [spo2, setSpo2] = useState(99);

  // Calculated BMI
  const bmi = heightCm > 0 ? (weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1) : '24.0';

  // Section 5: Functional Movement & McGill Big 3
  const [overheadSquatScore, setOverheadSquatScore] = useState(2);
  const [hurdleStepScore, setHurdleStepScore] = useState(2);
  const [shoulderMobilityScore, setShoulderMobilityScore] = useState(3);
  const [trunkStabilityPushup, setTrunkStabilityPushup] = useState(2);
  const [birdDogScore, setBirdDogScore] = useState(2);
  const [sidePlankHoldSec, setSidePlankHoldSec] = useState(45);
  const [postureNotes, setPostureNotes] = useState('Anterior pelvic tilt with tight hip flexors and weak transverse abdominis');

  // Section 6: Cardio & Strength
  const [submaxCardioTest, setSubmaxCardioTest] = useState('YMCA 3-minute step test (Good recovery)');
  const [gripStrengthKg, setGripStrengthKg] = useState(46);
  const [pushupCount, setPushupCount] = useState(22);
  const [plankHoldSeconds, setPlankHoldSeconds] = useState(55);

  // Section 7: Clinical Prescription Notes
  const [findings, setFindings] = useState('Mechanical low back pain secondary to core deconditioning and anterior pelvic tilt.');
  const [exercisePrescription, setExercisePrescription] = useState('McGill Big 3 (Bird-Dog, Side Plank, Modified Curl-up), Glute Bridges, Goblet Squats with neutral spine.');
  const [contraindications, setContraindications] = useState('Avoid loaded spinal flexion and rotational twists.');
  const [nextReviewDate, setNextReviewDate] = useState('6 Weeks');

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/specialists'),
        ]);

        const cData = await cRes.json();
        const sData = await sRes.json();

        setClients(Array.isArray(cData) ? cData : []);
        setSpecialists(Array.isArray(sData) ? sData : []);

        if (sData.length > 0 && !specialistId) {
          setSpecialistId(sData[0].id);
        }
        if (cData.length > 0 && !clientId && !preselectedClientId) {
          setClientId(cData[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select a client');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clientId,
        specialistId,
        type,
        healthScreening: {
          parQAnswer,
          medicalConditions: medicalConditions.split(',').map((s) => s.trim()),
          redFlags: redFlags.split(',').map((s) => s.trim()),
          physicianClearanceRequired,
          physicianClearanceObtained,
        },
        medicalHistory: {
          surgeries,
          injuries,
          currentMedications,
          painAreas: painAreas.split(',').map((s) => s.trim()),
        },
        goals: {
          primaryGoal,
          timelineWeeks: Number(timelineWeeks),
          sportsOrActivities,
        },
        baselineMetrics: {
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          bmi: Number(bmi),
          restingHeartRate: Number(restingHeartRate),
          bloodPressureSystolic: Number(bloodPressureSystolic),
          bloodPressureDiastolic: Number(bloodPressureDiastolic),
          bodyFatPercent: Number(bodyFatPercent),
          spo2: Number(spo2),
        },
        functionalMovement: {
          overheadSquatScore: Number(overheadSquatScore),
          hurdleStepScore: Number(hurdleStepScore),
          shoulderMobilityScore: Number(shoulderMobilityScore),
          trunkStabilityPushup: Number(trunkStabilityPushup),
          birdDogScore: Number(birdDogScore),
          sidePlankHoldSec: Number(sidePlankHoldSec),
          postureNotes,
        },
        cardioStrength: {
          submaxCardioTest,
          gripStrengthKg: Number(gripStrengthKg),
          pushupCount: Number(pushupCount),
          plankHoldSeconds: Number(plankHoldSeconds),
        },
        clinicalNotes: {
          findings,
          exercisePrescription,
          contraindications,
          nextReviewDate,
        },
      };

      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Clinical Assessment saved successfully!');
        router.push('/dashboard/assessments');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save assessment');
      }
    } catch (err) {
      alert('Error saving assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/assessments"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
              Fill Clinical Assessment & Intake Form
            </h1>
            <p className="text-xs text-slate-500">
              Structured clinical evaluation, baseline vitals, functional movement, and exercise prescription
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow transition flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          {submitting ? 'Saving...' : 'Save Assessment Form'}
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Panel 1: Evaluation Setup */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#1e3a8a] text-white px-5 py-2.5 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              1. Client & Specialist Setup
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-medium"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.clientId}) — {c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Evaluating Specialist *</label>
              <select
                value={specialistId}
                onChange={(e) => setSpecialistId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-medium"
              >
                {specialists.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assessment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-bold"
              >
                <option value="INITIAL">Initial Clinical Assessment</option>
                <option value="REASSESSMENT">Reassessment / Mid-Term Review</option>
                <option value="PROGRESS_REVIEW">Progress Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel 2: Pre-Exercise Screening & PAR-Q */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#1e3a8a] text-white px-5 py-2.5 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              2. Pre-Exercise Medical Screening & PAR-Q+ Flags
            </span>
          </div>

          <div className="p-5 space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Known Medical Conditions</label>
                <input
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. L4-L5 Disc Bulge, Postural Kyphosis"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Red Flags / Medical Cautions</label>
                <input
                  type="text"
                  value={redFlags}
                  onChange={(e) => setRedFlags(e.target.value)}
                  placeholder="e.g. No acute numbness or radiating pain"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-slate-800 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={physicianClearanceRequired}
                  onChange={(e) => setPhysicianClearanceRequired(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Physician Clearance Required</span>
              </label>

              <label className="flex items-center gap-2 text-slate-800 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={physicianClearanceObtained}
                  onChange={(e) => setPhysicianClearanceObtained(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600"
                />
                <span>Physician Clearance Obtained & On File</span>
              </label>
            </div>
          </div>
        </div>

        {/* Panel 3: Baseline Vitals & Biometrics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#1e3a8a] text-white px-5 py-2.5 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              3. Baseline Vitals & Anthropometrics
            </span>
          </div>

          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Auto BMI</label>
              <input
                type="text"
                readOnly
                value={`${bmi} kg/m²`}
                className="w-full bg-emerald-50 border border-emerald-200 rounded p-2 text-emerald-800 font-bold font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Resting HR</label>
              <input
                type="number"
                value={restingHeartRate}
                onChange={(e) => setRestingHeartRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">BP Systolic</label>
              <input
                type="number"
                value={bloodPressureSystolic}
                onChange={(e) => setBloodPressureSystolic(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">BP Diastolic</label>
              <input
                type="number"
                value={bloodPressureDiastolic}
                onChange={(e) => setBloodPressureDiastolic(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Body Fat %</label>
              <input
                type="number"
                step="0.1"
                value={bodyFatPercent}
                onChange={(e) => setBodyFatPercent(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Panel 4: Functional Movement Screen & McGill Big 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#1e3a8a] text-white px-5 py-2.5 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              4. Functional Movement Screen & McGill Big 3 Spine Stability
            </span>
          </div>

          <div className="p-5 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Overhead Squat</label>
                <select
                  value={overheadSquatScore}
                  onChange={(e) => setOverheadSquatScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value={1}>1 - Movement Deficit</option>
                  <option value={2}>2 - Minor Compensation</option>
                  <option value={3}>3 - Optimal Pattern</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hurdle Step</label>
                <select
                  value={hurdleStepScore}
                  onChange={(e) => setHurdleStepScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value={1}>1 - Deficit</option>
                  <option value={2}>2 - Minor Compensation</option>
                  <option value={3}>3 - Optimal Pattern</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">McGill Bird-Dog</label>
                <select
                  value={birdDogScore}
                  onChange={(e) => setBirdDogScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value={1}>1 - Lumbar Rotation / Tilt</option>
                  <option value={2}>2 - Minor Instability</option>
                  <option value={3}>3 - Stable Neutral Spine</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Side Plank Hold (Sec)</label>
                <input
                  type="number"
                  value={sidePlankHoldSec}
                  onChange={(e) => setSidePlankHoldSec(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Postural Alignment Findings</label>
              <input
                type="text"
                value={postureNotes}
                onChange={(e) => setPostureNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Panel 5: Specialist Clinical Findings & Exercise Prescription */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-[#1e3a8a] text-white px-5 py-2.5 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <FileHeart className="w-4 h-4 text-emerald-400" />
              5. Specialist Clinical Findings & Exercise Prescription
            </span>
          </div>

          <div className="p-5 space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Biomechanical Findings & Diagnosis</label>
              <textarea
                rows={2}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-emerald-800 mb-1">
                Prescribed Clinical Exercise Protocol (Exercises, Sets, Cues)
              </label>
              <textarea
                rows={3}
                value={exercisePrescription}
                onChange={(e) => setExercisePrescription(e.target.value)}
                className="w-full bg-emerald-50/40 border border-emerald-300 rounded p-2 text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-rose-700 mb-1">Contraindications & Movements to Avoid</label>
                <input
                  type="text"
                  value={contraindications}
                  onChange={(e) => setContraindications(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheduled Review Timeline</label>
                <input
                  type="text"
                  value={nextReviewDate}
                  onChange={(e) => setNextReviewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/assessments"
              className="px-4 py-2 rounded bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Submit Assessment Record'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
