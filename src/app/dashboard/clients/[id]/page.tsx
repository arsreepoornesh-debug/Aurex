'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Clock,
  Package,
  CreditCard,
  FileHeart,
  MessageSquare,
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Activity,
  UserCheck,
  XCircle,
  FileText,
  RotateCcw,
  ShieldCheck,
  Check,
  X,
  Trash2,
  Snowflake,
  Upload,
  Download,
  PenTool,
  Scale,
  ArrowUpRight,
  TrendingUp,
  History,
  FileBadge
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useSession } from 'next-auth/react';

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sessions' | 'packages' | 'payments' | 'assessments' | 'documents' | 'notes' | 'renewals'
  >('overview');

  // Modals
  const [showAssignPackageModal, setShowAssignPackageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [masterPackages, setMasterPackages] = useState<any[]>([]);

  // Freeze Modal State
  const [freezeForm, setFreezeForm] = useState({
    clientPackageId: '',
    freezeStartDate: new Date().toISOString().split('T')[0],
    freezeEndDate: '',
    reason: '',
  });

  // Document Upload State
  const [docForm, setDocForm] = useState({
    type: 'MEDICAL_CLEARANCE',
    fileName: '',
    notes: '',
    accessPermission: 'STAFF_ONLY',
  });

  // Consent Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [consentWitness, setConsentWitness] = useState('');

  // Assessment Compare selection
  const [compareAId, setCompareAId] = useState<string>('');
  const [compareBId, setCompareBId] = useState<string>('');

  // Package Form
  const [packageForm, setPackageForm] = useState({
    packageId: '',
    name: '',
    serviceType: 'SEMI_PRIVATE',
    totalSessions: 12,
    packageAmount: 24000,
    amountPaid: 24000,
    balanceRemaining: 0,
    validityDays: 90,
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'UPI',
    notes: '',
    clientPackageId: '',
    isRefund: false,
  });

  // Note Form
  const [noteForm, setNoteForm] = useState({
    content: '',
    category: 'CLINICAL',
  });

  async function loadClientData() {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        fetch(`/api/clients/${params.id}`),
        fetch('/api/packages'),
      ]);

      if (!cRes.ok) {
        throw new Error('Client not found');
      }

      const cData = await cRes.json();
      const pData = await pRes.json();

      setClient(cData);
      setMasterPackages(Array.isArray(pData) ? pData : []);

      if (pData.length > 0 && !packageForm.packageId) {
        const first = pData[0];
        setPackageForm({
          packageId: first.id,
          name: first.name,
          serviceType: first.serviceType,
          totalSessions: first.sessionCount,
          packageAmount: first.price,
          amountPaid: first.price,
          balanceRemaining: 0,
          validityDays: first.validityDays,
        });
      }
    } catch (err) {
      console.error('Error loading client:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientData();
  }, [params.id]);

  // Handle Master Package selection change
  function handleSelectMasterPackage(pkgId: string) {
    const selected = masterPackages.find((p) => p.id === pkgId);
    if (selected) {
      setPackageForm({
        packageId: selected.id,
        name: selected.name,
        serviceType: selected.serviceType,
        totalSessions: selected.sessionCount,
        packageAmount: selected.price,
        amountPaid: selected.price,
        balanceRemaining: 0,
        validityDays: selected.validityDays,
      });
    }
  }

  // Submit Assign Package
  async function handleAssignPackage(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          ...packageForm,
        }),
      });

      if (res.ok) {
        setShowAssignPackageModal(false);
        loadClientData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to assign package');
      }
    } catch (err) {
      alert('Error assigning package');
    }
  }

  // Submit Freeze Package
  async function handleFreezePackage(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/packages/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientPackageId: freezeForm.clientPackageId || client.packages?.[0]?.id,
          freezeStartDate: freezeForm.freezeStartDate,
          freezeEndDate: freezeForm.freezeEndDate || null,
          reason: freezeForm.reason,
        }),
      });

      if (res.ok) {
        alert('✅ Package frozen. Expiry date extended automatically.');
        setShowFreezeModal(false);
        loadClientData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to freeze package');
      }
    } catch (err) {
      alert('Error freezing package');
    }
  }

  // Submit Record Payment
  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          clientPackageId: paymentForm.clientPackageId || client.packages?.[0]?.id || null,
          amount: Number(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes,
          isRefund: paymentForm.isRefund,
        }),
      });

      if (res.ok) {
        setShowPaymentModal(false);
        setPaymentForm({
          amount: '',
          paymentMethod: 'UPI',
          notes: '',
          clientPackageId: '',
          isRefund: false,
        });
        loadClientData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record payment');
      }
    } catch (err) {
      alert('Error recording payment');
    }
  }

  // Submit Document Upload
  async function handleUploadDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!docForm.fileName) return;
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          type: docForm.type,
          fileName: docForm.fileName,
          notes: docForm.notes,
          accessPermission: docForm.accessPermission,
        }),
      });

      if (res.ok) {
        setShowDocUploadModal(false);
        setDocForm({ type: 'MEDICAL_CLEARANCE', fileName: '', notes: '', accessPermission: 'STAFF_ONLY' });
        loadClientData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Canvas Drawing Handlers for Digital Signature
  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function handleSaveConsent() {
    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL() : '';
    try {
      const res = await fetch('/api/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          consentVersion: 'v1.0',
          consentText: 'I acknowledge participation in AUREX Clinical Exercise Programming under specialist guidance...',
          digitalSignature: signatureData,
          acknowledgedBy: consentWitness || (session?.user as any)?.name || 'Admin',
        }),
      });

      if (res.ok) {
        alert('✅ Digital consent and signature recorded securely.');
        setShowConsentModal(false);
        loadClientData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Delete Client
  async function handleDeleteClient() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Client removed successfully');
        router.push('/dashboard/clients');
      } else {
        alert(data.error || 'Failed to delete client');
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (err) {
      alert('Error deleting client');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading || !client) {
    return (
      <div>
        <Header title="Client 360° Profile" subtitle="Loading clinical records..." />
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const activePackage = client.packages?.find((p: any) => p.status === 'ACTIVE') || client.packages?.[0];
  const progressPercent = activePackage
    ? Math.round((activePackage.sessionsUsed / activePackage.totalSessions) * 100)
    : 0;

  // Outstanding balance
  const totalBalance = client.packages?.reduce((acc: number, p: any) => acc + (p.balanceRemaining || 0), 0) || 0;

  return (
    <div>
      <Header
        title={`${client.name} — 360° Profile`}
        subtitle={`Universal ID: ${client.clientId} • Registered ${formatDate(client.registrationDate)}`}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Clients Directory</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAssignPackageModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A253A] hover:bg-[#23334E] text-slate-200 text-xs font-bold border border-[#2B3E5E] transition"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>+ Assign Package</span>
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A253A] hover:bg-[#23334E] text-slate-200 text-xs font-bold border border-[#2B3E5E] transition"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>+ Record Payment</span>
            </button>

            <button
              onClick={() => setShowDocUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A253A] hover:bg-[#23334E] text-slate-200 text-xs font-bold border border-[#2B3E5E] transition"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={() => setShowConsentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A253A] hover:bg-[#23334E] text-slate-200 text-xs font-bold border border-[#2B3E5E] transition"
            >
              <PenTool className="w-4 h-4 text-purple-400" />
              <span>Digital Consent</span>
            </button>

            <Link
              href={`/dashboard/assessments/new?clientId=${client.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
            >
              <FileHeart className="w-4 h-4" />
              <span>+ New Assessment</span>
            </Link>

            {userRole === 'OWNER' && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 text-xs font-bold border border-red-800/50 transition"
                title="Remove this client"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Client Core Header Card */}
        <div className="clinical-card p-6 border-emerald-500/30 bg-gradient-to-r from-[#121B2D] via-[#162137] to-[#111A2C]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white">{client.name}</h1>
                <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {client.clientId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {client.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {client.phone}
                </span>
                {client.email && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {client.email}
                  </span>
                )}
                <span className="text-slate-500">•</span>
                <span>Gender: {client.gender || 'N/A'}</span>
                <span className="text-slate-500">•</span>
                <span>Referral: {client.referralSource}</span>
              </div>
            </div>

            {/* Specialist & Active Package summary */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="p-3 rounded-xl bg-[#0D1524] border border-[#23334E] text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Assigned Specialist
                </span>
                <span className="text-xs font-bold text-white flex items-center justify-end gap-1.5 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: client.assignedSpecialist?.colorCode || '#10B981' }}
                  />
                  {client.assignedSpecialist?.name || 'Dr. Raghav Mehta'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0D1524] border border-[#23334E] text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Active Package
                </span>
                <span className="text-xs font-black text-emerald-400 block mt-0.5 font-mono">
                  {activePackage
                    ? `${activePackage.sessionsRemaining} / ${activePackage.totalSessions} Left`
                    : 'No Active Package'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 8 Dedicated 360 Profile Tabs */}
        <div className="border-b border-[#1F2C42] flex overflow-x-auto gap-2 scrollbar-none">
          {[
            { id: 'overview', label: '1. Overview', icon: Users },
            { id: 'sessions', label: `2. Sessions (${client.bookings?.length || 0})`, icon: Calendar },
            { id: 'packages', label: `3. Packages (${client.packages?.length || 0})`, icon: Package },
            { id: 'payments', label: `4. Ledger (${client.payments?.length || 0})`, icon: CreditCard },
            { id: 'assessments', label: `5. Assessments (${client.assessments?.length || 0})`, icon: FileHeart },
            { id: 'documents', label: `6. Documents & Consent (${client.documents?.length || 0})`, icon: FileBadge },
            { id: 'notes', label: `7. Notes & CRM (${client.notes?.length || 0})`, icon: MessageSquare },
            { id: 'renewals', label: '8. Renewals', icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap -mb-[1px] ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="clinical-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Client Demographics
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-500 block">Address:</span>
                    <span className="text-slate-200 font-medium">{client.address || 'DLF Phase 5, Gurugram'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Birth:</span>
                    <span className="text-slate-200 font-medium">{client.dob ? formatDate(client.dob) : '15 May 1990'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Registration:</span>
                    <span className="text-slate-200 font-medium">{formatDate(client.registrationDate)}</span>
                  </div>
                </div>
              </div>

              <div className="clinical-card p-5 border-rose-500/20 bg-rose-950/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4" />
                  Emergency Contact
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Contact Person:</span>
                    <span className="text-white font-bold">{client.emergencyContact || 'Meenakshi (Spouse)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Emergency Phone:</span>
                    <span className="text-rose-300 font-mono font-bold">{client.emergencyPhone || '+91 98765 00000'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              {/* Active Package Tracker */}
              <div className="clinical-card p-5 border-[#2E3F5C]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-400" />
                    Active Package Tracker
                  </h3>
                  {activePackage && (
                    <span className="text-xs font-bold text-slate-400">
                      Expires: {formatDate(activePackage.expiryDate)}
                    </span>
                  )}
                </div>

                {activePackage ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-white">{activePackage.name}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {activePackage.sessionsRemaining} / {activePackage.totalSessions} Left
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-3 mb-3 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs mt-3 pt-3 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Total</span>
                        <span className="font-bold text-white">{activePackage.totalSessions}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Used</span>
                        <span className="font-bold text-emerald-400">{activePackage.sessionsUsed}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Remaining</span>
                        <span className="font-bold text-teal-300">{activePackage.sessionsRemaining}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Status</span>
                        <span className="font-bold text-slate-200">{activePackage.status}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No active package assigned.</p>
                )}
              </div>

              {/* Latest Assessment Snapshot */}
              <div className="clinical-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-blue-400" />
                  Prescribed McGill Big 3 & Clinical Goals
                </h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong>Goals:</strong> Core stabilization, pain-free posture & return to recreational sports (Swimming, Badminton).
                  </p>
                  <p className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong>Exercise Prescription:</strong> McGill Big 3 (Bird-Dog, Side Plank, Modified Curl-up), Glute Bridges, Neutral Spine Goblet Squats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SESSIONS ================= */}
        {activeTab === 'sessions' && (
          <div className="clinical-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              All Booked & Completed Sessions ({client.bookings?.length || 0})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#26354D] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Session Date & Time</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Specialist</th>
                    <th className="pb-3">Booking Status</th>
                    <th className="pb-3 pr-2">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2C42]">
                  {client.bookings?.map((b: any) => {
                    const att = client.attendances?.find((a: any) => a.sessionId === b.sessionId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 pl-2 font-bold text-white">
                          {formatDate(b.session?.date)} ({b.session?.startTime} - {b.session?.endTime})
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {b.session?.serviceType?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300">{b.session?.specialist?.name || 'Dr. Raghav Mehta'}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 pr-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {att?.status || 'PRESENT'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PACKAGES ================= */}
        {activeTab === 'packages' && (
          <div className="clinical-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                All Current & Historical Packages ({client.packages?.length || 0})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFreezeModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-700/50 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Snowflake className="w-3.5 h-3.5" />
                  <span>Freeze Package</span>
                </button>
                <button
                  onClick={() => setShowAssignPackageModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
                >
                  + Assign Package
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {client.packages?.map((pkg: any) => (
                <div key={pkg.id} className="p-4 rounded-xl bg-[#0E1524] border border-[#1F2C42] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{pkg.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pkg.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {pkg.status}
                      </span>
                      {pkg.expiryAdjustment > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          +{pkg.expiryAdjustment} Days Frozen
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Validity: {formatDate(pkg.startDate)} to {formatDate(pkg.expiryDate)} • {pkg.serviceType.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Sessions</span>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {pkg.sessionsRemaining} / {pkg.totalSessions} Left
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Amount</span>
                      <span className="text-sm font-mono font-bold text-white">
                        {formatCurrency(pkg.packageAmount || 24000)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: PAYMENTS & LEDGER ================= */}
        {activeTab === 'payments' && (
          <div className="clinical-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Ledger & Invoices</h3>
                <span className="text-xs text-slate-500">Outstanding Balance: ₹{totalBalance.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-glow-gold transition"
              >
                + Record Payment
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#26354D] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Invoice No</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Balance</th>
                    <th className="pb-3 pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2C42]">
                  {client.payments?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 pl-2 font-mono font-black text-amber-400">{p.invoiceNumber}</td>
                      <td className="py-3 text-slate-300">{formatDate(p.paymentDate)}</td>
                      <td className="py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{p.paymentMethod}</span></td>
                      <td className="py-3 font-mono font-bold text-emerald-400">{formatCurrency(p.amountPaid || p.amount)}</td>
                      <td className="py-3 font-mono text-slate-400">{formatCurrency(p.balanceRemaining || 0)}</td>
                      <td className="py-3 pr-2"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: ASSESSMENTS ================= */}
        {activeTab === 'assessments' && (
          <div className="clinical-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Assessments</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-700/50 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Compare Assessments</span>
                </button>
                <Link
                  href={`/dashboard/assessments/new?clientId=${client.id}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
                >
                  + New Assessment
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {client.assessments?.map((a: any) => (
                <div key={a.id} className="p-4 rounded-xl bg-[#0E1524] border border-[#1F2C42] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white">{a.type} Clinical Assessment</span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Date: {formatDate(a.assessmentDate || a.date)} • Specialist: {a.specialist?.name || 'Dr. Raghav Mehta'}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      McGill Big 3 Recorded
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: DOCUMENTS & DIGITAL CONSENT ================= */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Documents List */}
            <div className="clinical-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Uploaded Medical Documents
                </h3>
                <button
                  onClick={() => setShowDocUploadModal(true)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition"
                >
                  + Upload
                </button>
              </div>

              <div className="space-y-2">
                {client.documents?.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No documents uploaded.</p>
                ) : (
                  client.documents?.map((d: any) => (
                    <div key={d.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{d.fileName}</span>
                        <span className="text-[10px] text-slate-400">{d.type} • {d.accessPermission}</span>
                      </div>
                      <button className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Consent Records */}
            <div className="clinical-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-purple-400" />
                  Digital Consent Records
                </h3>
                <button
                  onClick={() => setShowConsentModal(true)}
                  className="px-2.5 py-1 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-700/50 rounded-lg text-xs font-bold transition"
                >
                  + New Consent
                </button>
              </div>

              <div className="space-y-2">
                {client.consents?.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No digital consent recorded.</p>
                ) : (
                  client.consents?.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Consent {c.consentVersion}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Witness: {c.acknowledgedBy} • IP: {c.ipAddress}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: NOTES & CRM ================= */}
        {activeTab === 'notes' && (
          <div className="clinical-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical & Operational Notes</h3>
            <div className="space-y-3">
              {client.notes?.map((n: any) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-emerald-400">{n.category}</span>
                    <span>{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-200">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 8: RENEWALS ================= */}
        {activeTab === 'renewals' && (
          <div className="clinical-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Package Renewal Transitions</h3>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Initial Package Assignment</span>
                <span className="text-[11px] text-slate-400">Semi-Private 12 Sessions • Active</span>
              </div>
              <button
                onClick={() => setShowAssignPackageModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
              >
                Renew Package Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ASSIGN / RENEW PACKAGE */}
      {showAssignPackageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#26354D] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Assign / Renew Package</h2>
              <button onClick={() => setShowAssignPackageModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignPackage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Catalog Package</label>
                <select
                  value={packageForm.packageId}
                  onChange={(e) => handleSelectMasterPackage(e.target.value)}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                >
                  {masterPackages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Sessions</label>
                  <input
                    type="number"
                    value={packageForm.totalSessions}
                    onChange={(e) => setPackageForm({ ...packageForm, totalSessions: Number(e.target.value) })}
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={packageForm.packageAmount}
                    onChange={(e) => setPackageForm({ ...packageForm, packageAmount: Number(e.target.value) })}
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
              >
                Confirm Package Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FREEZE PACKAGE */}
      {showFreezeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#26354D] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-400" />
                Freeze Package / Medical Hold
              </h2>
              <button onClick={() => setShowFreezeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFreezePackage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Freeze Start Date</label>
                <input
                  type="date"
                  value={freezeForm.freezeStartDate}
                  onChange={(e) => setFreezeForm({ ...freezeForm, freezeStartDate: e.target.value })}
                  required
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Freeze End Date</label>
                <input
                  type="date"
                  value={freezeForm.freezeEndDate}
                  onChange={(e) => setFreezeForm({ ...freezeForm, freezeEndDate: e.target.value })}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Reason for Hold</label>
                <textarea
                  rows={2}
                  value={freezeForm.reason}
                  onChange={(e) => setFreezeForm({ ...freezeForm, reason: e.target.value })}
                  placeholder="Medical leave, travel, surgery recovery..."
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition"
              >
                Apply Freeze & Extend Validity
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL CONSENT SIGNATURE */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#26354D] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-purple-400" />
                Record Digital Consent
              </h2>
              <button onClick={() => setShowConsentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300 max-h-24 overflow-y-auto">
              I acknowledge that clinical exercise and rehabilitation involves progressive physical conditioning under specialist guidance.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Witnessing Staff Name</label>
              <input
                type="text"
                value={consentWitness}
                onChange={(e) => setConsentWitness(e.target.value)}
                placeholder="Dr. Siddharth Rao"
                className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-400">Digital Signature Canvas</label>
                <button type="button" onClick={clearCanvas} className="text-[10px] text-rose-400 hover:underline">
                  Clear
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={380}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl cursor-crosshair"
              />
            </div>

            <button
              onClick={handleSaveConsent}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition"
            >
              Sign & Save Consent
            </button>
          </div>
        </div>
      )}

      {/* MODAL: DOCUMENT UPLOAD */}
      {showDocUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#26354D] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Upload Client Document</h2>
              <button onClick={() => setShowDocUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Document Type</label>
                <select
                  value={docForm.type}
                  onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="MEDICAL_CLEARANCE">Medical Clearance Certificate</option>
                  <option value="REFERRAL">Doctor Referral Letter</option>
                  <option value="PAR_Q">PAR-Q Form</option>
                  <option value="CONSENT_FORM">Consent Form</option>
                  <option value="OTHER">Other Clinical Record</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">File Name</label>
                <input
                  type="text"
                  value={docForm.fileName}
                  onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                  placeholder="Spine_Clearance_Puneesh.pdf"
                  required
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition"
              >
                Save Document Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#26354D] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Record Payment / Generate Invoice</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="24000"
                  required
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notes / Transaction Ref</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="UPI Ref: 4892749219"
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition"
              >
                Log Payment & Generate INV-AUR-2026-XXXX
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
