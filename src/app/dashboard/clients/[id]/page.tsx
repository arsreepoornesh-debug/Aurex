'use client';

import { useState, useEffect } from 'react';
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
    'overview' | 'sessions' | 'packages' | 'payments' | 'assessments' | 'notes'
  >('overview');

  // Modals
  const [showAssignPackageModal, setShowAssignPackageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [masterPackages, setMasterPackages] = useState<any[]>([]);

  // Package Form
  const [packageForm, setPackageForm] = useState({
    packageId: '',
    name: '',
    serviceType: 'SEMI_PRIVATE',
    totalSessions: 12,
    pricePaid: 24000,
    balanceRemaining: 0,
    validityDays: 60,
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
    category: 'GENERAL',
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
          pricePaid: first.price,
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
        pricePaid: selected.price,
        balanceRemaining: 0,
        validityDays: selected.validityDays,
      });
    }
  }

  // Submit Assign Package
  async function handleAssignPackage(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clients/${client.id}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageForm),
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

  // Submit Add Note
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteForm.content.trim()) return;

    try {
      // Direct call to note endpoint or save
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // client update if needed
        }),
      });
      // We can also post note
      setNoteForm({ content: '', category: 'GENERAL' });
      loadClientData();
    } catch (err) {
      console.error(err);
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAssignPackageModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1A253A] hover:bg-[#23334E] text-slate-200 text-xs font-bold border border-[#2B3E5E] transition"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>+ Assign Package</span>
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1A253A] hover:bg-[#23334E] text-slate-200 text-xs font-bold border border-[#2B3E5E] transition"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>+ Record Payment</span>
            </button>

            <Link
              href={`/dashboard/assessments/new?clientId=${client.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
            >
              <FileHeart className="w-4 h-4" />
              <span>+ New Assessment</span>
            </Link>
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
                  {client.assignedSpecialist?.name || 'Unassigned'}
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

        {/* 360 Profile Tabs Bar */}
        <div className="border-b border-[#1F2C42] flex gap-2">
          {[
            { id: 'overview', label: 'Overview & Vitals', icon: Users },
            { id: 'sessions', label: `Sessions (${client.bookings?.length || 0})`, icon: Calendar },
            { id: 'packages', label: `Packages (${client.packages?.length || 0})`, icon: Package },
            { id: 'payments', label: `Payments & Ledger (${client.payments?.length || 0})`, icon: CreditCard },
            { id: 'assessments', label: `Assessments (${client.assessments?.length || 0})`, icon: FileHeart },
            { id: 'notes', label: `Notes & CRM (${client.notes?.length || 0})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition -mb-[1px] ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB CONTENT ================= */}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Col: Personal & Emergency Details */}
            <div className="space-y-4">
              <div className="clinical-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Client Demographics
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-500 block">Residential Address:</span>
                    <span className="text-slate-200 font-medium">
                      {client.address || 'Address not logged'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Birth:</span>
                    <span className="text-slate-200 font-medium">
                      {client.dob ? formatDate(client.dob) : 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Registration Date:</span>
                    <span className="text-slate-200 font-medium">
                      {formatDateTime(client.registrationDate)}
                    </span>
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
                    <span className="text-white font-bold">
                      {client.emergencyContactName || 'Not recorded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Emergency Phone:</span>
                    <span className="text-rose-300 font-mono font-bold">
                      {client.emergencyContactPhone || 'Not recorded'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Right Col: Active Package & Latest Assessment Highlights */}
            <div className="md:col-span-2 space-y-4">
              {/* Active Package Tracker */}
              <div className="clinical-card p-5 border-[#2E3F5C]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-400" />
                    Current Active Package Tracker
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
                        {activePackage.sessionsRemaining} / {activePackage.totalSessions} Sessions Remaining
                      </span>
                    </div>

                    {/* Progress Bar */}
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
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No active package assigned. Click "+ Assign Package" to assign one.
                  </div>
                )}
              </div>

              {/* Latest Assessment Snapshot */}
              <div className="clinical-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-blue-400" />
                    Latest Clinical Assessment Snapshot
                  </h3>
                  {client.assessments?.[0] && (
                    <span className="text-xs text-slate-400">
                      {formatDate(client.assessments[0].date)}
                    </span>
                  )}
                </div>

                {client.assessments?.[0] ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#0E1524] border border-[#1F2C42]">
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">
                        Clinical Exercise Prescription & Notes:
                      </span>
                      <p className="text-slate-200 mt-1">
                        {(() => {
                          try {
                            const notes = JSON.parse(client.assessments[0].clinicalNotes);
                            return notes.exercisePrescription || notes.findings || 'No notes logged';
                          } catch {
                            return client.assessments[0].clinicalNotes || 'No notes logged';
                          }
                        })()}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0E1524] border border-[#1F2C42]">
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">
                        Client Goals:
                      </span>
                      <p className="text-slate-200 mt-1">
                        {(() => {
                          try {
                            const goals = JSON.parse(client.assessments[0].goals);
                            return goals.primaryGoal || 'No goals specified';
                          } catch {
                            return client.assessments[0].goals || 'No goals specified';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No assessment on file. Click "+ New Assessment" to record an Initial Assessment.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SESSIONS & ATTENDANCE */}
        {activeTab === 'sessions' && (
          <div className="clinical-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              All Booked & Completed Sessions ({client.bookings?.length || 0})
            </h3>

            {client.bookings?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No session bookings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#26354D] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Session Date & Time</th>
                      <th className="pb-3">Service Type</th>
                      <th className="pb-3">Specialist Assigned</th>
                      <th className="pb-3">Booking Status</th>
                      <th className="pb-3 pr-2">Attendance Marked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2C42]">
                    {client.bookings.map((b: any) => {
                      const att = client.attendances?.find((a: any) => a.sessionId === b.sessionId);
                      return (
                        <tr key={b.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 pl-2 font-bold text-white">
                            {formatDate(b.session.date)} ({b.session.startTime} - {b.session.endTime})
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {b.session.serviceType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 text-slate-300">{b.session.specialist.name}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 pr-2">
                            {att ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  att.status === 'PRESENT'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : att.status === 'ABSENT'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {att.status} ({formatDateTime(att.markedAt)})
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="clinical-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Package History ({client.packages?.length || 0})
              </h3>
              <button
                onClick={() => setShowAssignPackageModal(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
              >
                + Assign New Package
              </button>
            </div>

            {client.packages?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No packages on record.</p>
            ) : (
              <div className="space-y-3">
                {client.packages.map((pkg: any) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-xl bg-[#0E1524] border border-[#1F2C42] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{pkg.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            pkg.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Service: {pkg.serviceType.replace('_', ' ')} • Validity: {formatDate(pkg.startDate)} to {formatDate(pkg.expiryDate)}
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
                        <span className="text-[10px] text-slate-500 uppercase block">Price Paid</span>
                        <span className="text-sm font-mono font-bold text-white">
                          {formatCurrency(pkg.pricePaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENTS & LEDGER */}
        {activeTab === 'payments' && (
          <div className="clinical-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Payment History & Invoices ({client.payments?.length || 0})
              </h3>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-glow-gold transition"
              >
                + Record Payment
              </button>
            </div>

            {client.payments?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No payments recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#26354D] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Invoice Number</th>
                      <th className="pb-3">Payment Date</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Balance Remaining</th>
                      <th className="pb-3 pr-2">Status & Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2C42]">
                    {client.payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 pl-2 font-mono font-black text-amber-400">
                          {p.invoiceNumber}
                        </td>
                        <td className="py-3 text-slate-300">{formatDateTime(p.paymentDate)}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 font-mono font-bold text-emerald-400">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3 font-mono text-slate-400">
                          {formatCurrency(p.balanceRemaining)}
                        </td>
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {p.status}
                            </span>
                            {p.notes && <span className="text-slate-400 text-[11px] truncate max-w-[200px]">{p.notes}</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CLINICAL ASSESSMENTS */}
        {activeTab === 'assessments' && (
          <div className="clinical-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Clinical Assessment Records ({client.assessments?.length || 0})
              </h3>
              <Link
                href={`/dashboard/assessments/new?clientId=${client.id}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition"
              >
                + New Assessment
              </Link>
            </div>

            {client.assessments?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No clinical assessments on file.</p>
            ) : (
              <div className="space-y-4">
                {client.assessments.map((a: any) => (
                  <div key={a.id} className="p-4 rounded-xl bg-[#0E1524] border border-[#1F2C42]">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <div>
                        <span className="text-sm font-black text-white">{a.type} Assessment</span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          Conducted on {formatDate(a.date)} by {a.specialist?.name || 'Specialist'}
                        </span>
                      </div>
                      <Link
                        href={`/dashboard/assessments/${a.id}`}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition border border-emerald-500/30"
                      >
                        View Full Clinical Record
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#0A0F1D] border border-slate-800">
                        <span className="text-slate-500 text-[10px] font-bold uppercase block">Health Screening</span>
                        <p className="text-slate-300 mt-1 truncate">
                          {(() => {
                            try {
                              const hs = JSON.parse(a.healthScreening);
                              return hs.medicalConditions?.join(', ') || 'No conditions noted';
                            } catch {
                              return 'Details logged';
                            }
                          })()}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0A0F1D] border border-slate-800">
                        <span className="text-slate-500 text-[10px] font-bold uppercase block">Primary Goal</span>
                        <p className="text-slate-300 mt-1 truncate">
                          {(() => {
                            try {
                              const g = JSON.parse(a.goals);
                              return g.primaryGoal || 'General conditioning';
                            } catch {
                              return 'Details logged';
                            }
                          })()}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0A0F1D] border border-slate-800">
                        <span className="text-slate-500 text-[10px] font-bold uppercase block">Clinical Notes</span>
                        <p className="text-slate-300 mt-1 truncate">
                          {(() => {
                            try {
                              const cn = JSON.parse(a.clinicalNotes);
                              return cn.exercisePrescription || 'Prescription logged';
                            } catch {
                              return 'Details logged';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: NOTES & CRM */}
        {activeTab === 'notes' && (
          <div className="clinical-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Staff Notes & CRM Follow-up Timeline
            </h3>

            {client.notes?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No notes added yet.</p>
            ) : (
              <div className="space-y-2.5">
                {client.notes.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-lg bg-[#0E1524] border border-[#1F2C42] text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                      <span className="font-bold text-slate-300">{n.author?.name || 'Staff'} ({n.category})</span>
                      <span>{formatDateTime(n.createdAt)}</span>
                    </div>
                    <p className="text-slate-200">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL: ASSIGN PACKAGE ================= */}
      {showAssignPackageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clinical-card w-full max-w-md p-6 border-[#384F73] bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Assign Package to {client.name}
              </h3>
              <button
                onClick={() => setShowAssignPackageModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPackage} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Master Package
                </label>
                <select
                  value={packageForm.packageId}
                  onChange={(e) => handleSelectMasterPackage(e.target.value)}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                >
                  {masterPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sessionCount} sessions)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Total Sessions
                  </label>
                  <input
                    type="number"
                    required
                    value={packageForm.totalSessions}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, totalSessions: Number(e.target.value) })
                    }
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    required
                    value={packageForm.validityDays}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, validityDays: Number(e.target.value) })
                    }
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Package Price (₹)
                  </label>
                  <input
                    type="number"
                    value={packageForm.pricePaid}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, pricePaid: Number(e.target.value) })
                    }
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Balance Due (₹)
                  </label>
                  <input
                    type="number"
                    value={packageForm.balanceRemaining}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, balanceRemaining: Number(e.target.value) })
                    }
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignPackageModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald"
                >
                  Assign Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD PAYMENT ================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clinical-card w-full max-w-md p-6 border-[#384F73] bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                Record Payment for {client.name}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="24000"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })
                    }
                    className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction Notes / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref: 4892749219"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-glow-gold"
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
