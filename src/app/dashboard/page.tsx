'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  PlusCircle,
  Sparkles,
  RefreshCw,
  UserCheck,
  UserX,
  Stethoscope,
  Check,
  X,
  Bell,
  Filter,
  ArrowRight,
  FileText,
  CalendarCheck,
  Award,
  Layers,
  PhoneCall,
  Lock,
  IndianRupee,
  TrendingDown,
  LineChart,
  UserPlus,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Phone,
  Mail,
  CalendarDays,
  Eye,
  EyeOff,
  Sliders,
  Wallet,
  Receipt,
  Armchair,
  UsersRound,
  BarChart3,
  LayoutGrid,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate, formatDateTime, getServiceMaxCapacity } from '@/lib/utils';
import { canViewRevenue } from '@/lib/rbac';

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';
  const showRevenue = canViewRevenue(userRole);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  // Lead banner visibility toggle
  const [showLeadBanner, setShowLeadBanner] = useState(true);

  // Slot availability collapse state
  const [showSlotAvailability, setShowSlotAvailability] = useState(true);

  // Date Filter State (Defaults to Today in YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(todayStr);
  const [toDate, setToDate] = useState<string>(todayStr);

  // Modals
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [selectedClientProfile, setSelectedClientProfile] = useState<any | null>(null);

  // Available clients & specialists for modals
  const [allClients, setAllClients] = useState<any[]>([]);
  const [allSpecialists, setAllSpecialists] = useState<any[]>([]);
  const [allPackages, setAllPackages] = useState<any[]>([]);

  // Form states
  const [bookForm, setBookForm] = useState({
    sessionId: '',
    clientId: '',
    clientPackageId: '',
  });

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    referralSource: 'Walk-in',
    status: 'ACTIVE',
    assignedSpecialistId: '',
  });

  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Instagram',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    clientId: '',
    clientPackageId: '',
    amount: '',
    paymentMethod: 'UPI',
    notes: '',
  });

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Dashboard data with date filters
  async function loadDashboard(from = fromDate, to = toDate) {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (from) queryParams.set('from', from);
      if (to) queryParams.set('to', to);

      const [dashRes, clientsRes, specsRes, pkgsRes] = await Promise.all([
        fetch(`/api/dashboard?${queryParams.toString()}`),
        fetch('/api/clients'),
        fetch('/api/specialists'),
        fetch('/api/packages'),
      ]);

      const dashData = await dashRes.json();
      const clientsData = await clientsRes.json();
      const specsData = await specsRes.json();
      const pkgsData = await pkgsRes.json();

      setData(dashData);
      setAllClients(Array.isArray(clientsData) ? clientsData : []);
      setAllSpecialists(Array.isArray(specsData) ? specsData : []);
      setAllPackages(Array.isArray(pkgsData) ? pkgsData : []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard(fromDate, toDate);
  }, []);

  function showNotification(type: 'success' | 'error', text: string) {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4500);
  }

  function handleApplyDateFilter(e: React.FormEvent) {
    e.preventDefault();
    loadDashboard(fromDate, toDate);
  }

  // Attendance Toggle
  async function handleMarkAttendance(sessionId: string, clientId: string, status: string) {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, clientId, status }),
      });

      if (res.ok) {
        showNotification('success', `Attendance updated to ${status}`);
        loadDashboard(fromDate, toDate);
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Failed to update attendance');
      }
    } catch (err) {
      showNotification('error', 'Error updating attendance');
    }
  }

  // Complete Session Handler
  async function handleCompleteSession(sessionId: string) {
    if (!confirm('Complete this session? Attending clients will have 1 session deducted from their active package.')) {
      return;
    }

    try {
      const res = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        showNotification('success', 'Session completed successfully and packages updated!');
        loadDashboard(fromDate, toDate);
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Failed to complete session');
      }
    } catch (err) {
      showNotification('error', 'Error completing session');
    }
  }

  // Quick Book Submit
  async function handleQuickBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookForm.sessionId || !bookForm.clientId) {
      showNotification('error', 'Please select both a session slot and client');
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm),
      });

      if (res.ok) {
        showNotification('success', 'Booking confirmed successfully!');
        setShowQuickBook(false);
        setBookForm({ sessionId: '', clientId: '', clientPackageId: '' });
        loadDashboard(fromDate, toDate);
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Booking failed');
      }
    } catch (err) {
      showNotification('error', 'Error creating booking');
    }
  }

  // New Client Submit
  async function handleNewClientSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone) {
      showNotification('error', 'Name and Phone are required');
      return;
    }

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      });

      if (res.ok) {
        showNotification('success', 'Client created successfully!');
        setShowNewClient(false);
        setClientForm({
          name: '',
          phone: '',
          email: '',
          referralSource: 'Walk-in',
          status: 'ACTIVE',
          assignedSpecialistId: '',
        });
        loadDashboard(fromDate, toDate);
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Failed to create client');
      }
    } catch (err) {
      showNotification('error', 'Error creating client');
    }
  }

  // Log Payment Submit
  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentForm.clientId || !paymentForm.amount) {
      showNotification('error', 'Client and Amount are required');
      return;
    }

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });

      if (res.ok) {
        showNotification('success', 'Payment logged and invoice generated!');
        setShowPaymentModal(false);
        setPaymentForm({ clientId: '', clientPackageId: '', amount: '', paymentMethod: 'UPI', notes: '' });
        loadDashboard(fromDate, toDate);
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Failed to log payment');
      }
    } catch (err) {
      showNotification('error', 'Error logging payment');
    }
  }

  // New Lead Submit
  async function handleNewLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      showNotification('error', 'Lead Name and Phone are required');
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      });

      if (res.ok) {
        showNotification('success', 'Enquiry / Lead recorded successfully!');
        setShowNewLeadModal(false);
        setLeadForm({ name: '', phone: '', email: '', source: 'Instagram', notes: '' });
        loadDashboard(fromDate, toDate);
      } else {
        const err = await res.json();
        showNotification('error', err.error || 'Failed to add lead');
      }
    } catch (err) {
      showNotification('error', 'Error creating lead');
    }
  }

  const stats = data?.stats || {};
  const enquiries = data?.enquiries || { totalPending: 0, recentList: [] };
  const newClientsToday = data?.newClientsToday || [];
  const todaySessions = data?.todaySessions || [];

  // Group today's sessions by time of day
  const morningSessions = todaySessions.filter((s: any) => {
    const hour = parseInt(s.startTime?.split(':')[0] || '0', 10);
    return hour < 12;
  });

  const afternoonSessions = todaySessions.filter((s: any) => {
    const hour = parseInt(s.startTime?.split(':')[0] || '0', 10);
    return hour >= 12 && hour < 17;
  });

  const eveningSessions = todaySessions.filter((s: any) => {
    const hour = parseInt(s.startTime?.split(':')[0] || '0', 10);
    return hour >= 17;
  });

  // Helper function to render a session slot card safely
  function renderSessionCard(session: any) {
    if (!session) return null;
    const bookedCount = session.bookings?.length || 0;
    const maxCap = session.maxCapacity || 4;
    const isFull = bookedCount >= maxCap;
    const percentFull = Math.min(100, Math.round((bookedCount / maxCap) * 100));

    return (
      <div
        key={session.id}
        className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
          session.status === 'COMPLETED'
            ? 'bg-slate-50/70 border-slate-200 opacity-90'
            : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {session.startTime} – {session.endTime}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    session.serviceType === 'PREMIUM'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-purple-50 text-purple-800 border border-purple-200'
                  }`}
                >
                  {session.serviceType === 'PREMIUM' ? 'Premium 1:1' : 'Semi-Private'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mt-1.5">{session.title}</h4>
            </div>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                session.status === 'COMPLETED'
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {session.status}
            </span>
          </div>

          {/* Specialist */}
          <div className="py-2 flex items-center justify-between text-xs border-b border-slate-100">
            <span className="text-slate-500 font-medium">Specialist:</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: session.specialist?.colorCode || '#10B981',
                }}
              />
              <span>{session.specialist?.name || 'Unassigned'}</span>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="py-2 space-y-1 border-b border-slate-100">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600">Capacity:</span>
              <span
                className={`font-bold font-mono ${
                  isFull ? 'text-rose-600 font-extrabold' : 'text-slate-800'
                }`}
              >
                {bookedCount}/{maxCap} {isFull ? 'FULL' : ''}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percentFull}%` }}
              />
            </div>
          </div>

          {/* Booked Clients with Live Attendance Toggle */}
          <div className="py-2.5 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Booked Clients ({bookedCount}):
            </div>

            {session.bookings && session.bookings.length > 0 ? (
              <div className="space-y-1.5">
                {session.bookings.map((b: any) => {
                  const clientAttendance = session.attendances?.find(
                    (a: any) => a.clientId === b.clientId
                  );
                  const currentStatus = clientAttendance?.status || 'PENDING';

                  return (
                    <div
                      key={b.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{b.client?.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : currentStatus === 'ABSENT'
                              ? 'bg-rose-100 text-rose-800'
                              : currentStatus === 'NO_SHOW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </div>

                      {session.status !== 'COMPLETED' && (
                        <div className="flex items-center gap-1 pt-1 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(session.id, b.clientId, 'PRESENT')}
                            className={`flex-1 py-0.5 rounded text-[10px] font-bold transition ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(session.id, b.clientId, 'ABSENT')}
                            className={`flex-1 py-0.5 rounded text-[10px] font-bold transition ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(session.id, b.clientId, 'NO_SHOW')}
                            className={`flex-1 py-0.5 rounded text-[10px] font-bold transition ${
                              currentStatus === 'NO_SHOW'
                                ? 'bg-amber-600 text-white'
                                : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                            }`}
                          >
                            No-show
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No clients booked in this slot.</p>
            )}
          </div>
        </div>

        {/* Complete Session Button */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          {!isFull && session.status !== 'COMPLETED' && (
            <button
              type="button"
              onClick={() => {
                setBookForm((prev) => ({ ...prev, sessionId: session.id }));
                setShowQuickBook(true);
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition"
            >
              + Add Client
            </button>
          )}

          {session.status !== 'COMPLETED' ? (
            <button
              type="button"
              onClick={() => handleCompleteSession(session.id)}
              className="ml-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete Session</span>
            </button>
          ) : (
            <span className="ml-auto text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Completed
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header
        title="AUREX Command Center"
        subtitle="Clinical Exercise Management & Live Operations"
      />

      <div className="p-6 max-w-[1600px] mx-auto space-y-4">
        {/* Toast Notification */}
        {actionMessage && (
          <div
            className={`p-3.5 rounded-xl flex items-center justify-between shadow-sm transition-all border ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <span className="text-xs font-semibold">{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="p-1 hover:bg-black/5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. TOP — LEAD CHIPS BANNER */}
        {showLeadBanner && (
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex items-center justify-between gap-3 overflow-hidden">
            {/* Horizontal Scrollable Row of Lead Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 flex-1 min-w-0">
              {enquiries.recentList && enquiries.recentList.length > 0 ? (
                <>
                  {enquiries.recentList.map((lead: any) => (
                    <div
                      key={lead.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium shrink-0 flex items-center gap-1.5 border border-slate-200/80 transition"
                    >
                      <span className="font-bold text-slate-900">{lead.name}</span>
                      <span className="text-slate-600 font-mono text-[11px]">{lead.phone}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 text-[11px]">{formatDate(lead.createdAt)}</span>
                    </div>
                  ))}

                  {enquiries.totalPending > enquiries.recentList.length && (
                    <Link
                      href="/dashboard/crm"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold shrink-0 border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      +{enquiries.totalPending - enquiries.recentList.length} more
                    </Link>
                  )}
                </>
              ) : (
                <div className="text-xs text-slate-500 italic px-2">
                  No new portal inquiries waiting. All leads are currently attended.
                </div>
              )}
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/dashboard/crm"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Review enquiries</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowLeadBanner(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. DATE FILTER ROW */}
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Label */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Summary Statistics</h2>
          </div>

          {/* Right Date Controls */}
          <form onSubmit={handleApplyDateFilter} className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 font-medium">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 font-medium">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-slate-800"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5 text-slate-300" />
              <span>Filter</span>
            </button>
          </form>
        </div>

        {/* 3. SUMMARY STATISTICS GRID */}
        {/* Exact Layout: 3 Rows of 4 Cards + 1 Card on Row 4 (Left-Aligned) */}
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* ========================================================================= */}
            {/* ROW 1 */}
            {/* ========================================================================= */}

            {/* Card 1: New clients (Green) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-right">New Clients</span>
              </div>
              <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                {loading ? '—' : stats.newClients ?? 0}
              </div>
              <div className="h-1 w-full bg-emerald-500 rounded-full mt-3" />
            </div>

            {/* Card 2: Total collection (Purple) — Hidden for RECEPTIONIST */}
            {showRevenue && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium text-right">Total Collection</span>
                </div>
                <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                  {loading ? '—' : formatCurrency(stats.totalCollection)}
                </div>
                <div className="h-1 w-full bg-purple-600 rounded-full mt-3" />
              </div>
            )}

            {/* Card 3: Total Expenses (Pink/Red) — Hidden for RECEPTIONIST */}
            {showRevenue && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium text-right">Total Expenses</span>
                </div>
                <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                  {loading ? '—' : formatCurrency(stats.totalExpenses)}
                </div>
                <div className="h-1 w-full bg-rose-500 rounded-full mt-3" />
              </div>
            )}

            {/* Card 4: Total PT Collection / Premium Collection (Yellow/Gold) — Hidden for RECEPTIONIST */}
            {showRevenue && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium text-right">Premium Collection</span>
                </div>
                <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                  {loading ? '—' : formatCurrency(stats.premiumCollection)}
                </div>
                <div className="h-1 w-full bg-amber-500 rounded-full mt-3" />
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROW 2 */}
            {/* ========================================================================= */}

            {/* Card 5: Profit/Loss (Orange) — Hidden for RECEPTIONIST */}
            {showRevenue && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium text-right">Profit / Loss</span>
                </div>
                <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                  {loading ? '—' : formatCurrency(stats.profitLoss)}
                </div>
                <div className="h-1 w-full bg-orange-500 rounded-full mt-3" />
              </div>
            )}

            {/* Card 6: Pending Inquiry(s) / Pending Leads (Green) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-right">Pending Leads</span>
              </div>
              <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                {loading ? '—' : stats.pendingLeads ?? 48}
              </div>
              <div className="h-1 w-full bg-emerald-600 rounded-full mt-3" />
            </div>

            {/* Card 7: Active clients (Blue) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-right">Active Clients</span>
              </div>
              <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                {loading ? '—' : stats.activeClients ?? 219}
              </div>
              <div className="h-1 w-full bg-blue-600 rounded-full mt-3" />
            </div>

            {/* Card 8: Inactive clients (Gray/Dark) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-xs">
                  <UserX className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-right">Inactive Clients</span>
              </div>
              <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                {loading ? '—' : stats.inactiveClients ?? 69}
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full mt-3" />
            </div>

            {/* ========================================================================= */}
            {/* ROW 3 */}
            {/* ========================================================================= */}

            {/* Card 9: Profile Created clients / Profiles Created (Gray/Dark) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-right">Profiles Created</span>
              </div>
              <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                {loading ? '—' : stats.profilesCreated ?? 0}
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full mt-3" />
            </div>

            {/* Card 10: Booked PT Sessions / Premium Booked (Green) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-right">Premium Booked</span>
              </div>
              <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                {loading ? '—' : stats.premiumBooked ?? 0}
              </div>
              <div className="h-1 w-full bg-emerald-500 rounded-full mt-3" />
            </div>

            {/* Card 11: Follow-ups (Orange) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-right">Follow-ups</span>
              </div>
              <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                {loading ? '—' : stats.followUps ?? 9}
              </div>
              <div className="h-1 w-full bg-orange-500 rounded-full mt-3" />
            </div>

            {/* Card 12: Today Present Client / Present Today (Blue/Purple) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-right">Present Today</span>
              </div>
              <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                {loading ? '—' : stats.presentToday ?? 0}
              </div>
              <div className="h-1 w-full bg-indigo-600 rounded-full mt-3" />
            </div>

            {/* ========================================================================= */}
            {/* ROW 4 — 1 Card (Left-Aligned, same width as 1 column) */}
            {/* ========================================================================= */}

            {/* Card 13: Booked Group Class / Semi-Private Booked (Purple) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between min-h-[105px]">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500 font-medium text-right">Semi-Private Booked</span>
              </div>
              <div className="text-[28px] font-bold text-slate-900 tracking-tight mt-2">
                {loading ? '—' : stats.semiPrivateBooked ?? 0}
              </div>
              <div className="h-1 w-full bg-purple-600 rounded-full mt-3" />
            </div>
          </div>
        </div>

        {/* 4. BATCH SEAT AVAILABILITY / SLOT AVAILABILITY SECTION */}
        <div className="space-y-3 pt-2">
          {/* Full Width Dark Navy Banner */}
          <div className="bg-[#0F172A] text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center">
                <Armchair className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold tracking-tight text-white">Slot Availability</h3>
                <span className="text-xs text-slate-400 font-mono bg-slate-800/90 px-2 py-0.5 rounded">
                  {stats.slotAvailability ?? 0} seats open today
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSlotAvailability(!showSlotAvailability)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium transition px-2.5 py-1 rounded-lg hover:bg-slate-800"
            >
              {showSlotAvailability ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>

          {/* Expandable Batches Section */}
          {showSlotAvailability && (
            <div className="space-y-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-in fade-in">
              {/* Morning Batches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Morning Batches (06:00 AM – 12:00 PM)</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {morningSessions.length} Scheduled Slot{morningSessions.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {morningSessions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No morning sessions scheduled for today.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {morningSessions.map((session: any) => renderSessionCard(session))}
                  </div>
                )}
              </div>

              {/* Afternoon & Evening Batches (if any) */}
              {afternoonSessions.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Afternoon Batches (12:00 PM – 05:00 PM)</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">{afternoonSessions.length} Slots</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {afternoonSessions.map((session: any) => renderSessionCard(session))}
                  </div>
                </div>
              )}

              {eveningSessions.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Evening Batches (05:00 PM – 09:00 PM)</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">{eveningSessions.length} Slots</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {eveningSessions.map((session: any) => renderSessionCard(session))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. NEW CLIENTS SECTION (TODAY'S REGISTRATIONS) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">New Clients Registered Today</h3>
                <p className="text-xs text-slate-500">
                  Click any client row to inspect full clinical profile.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNewClient(true)}
              className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ New Client</span>
            </button>
          </div>

          {newClientsToday.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No new clients registered today yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Use "+ New Client" to onboard registrations today.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                  <tr>
                    <th className="p-3">Client ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Referral Source</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newClientsToday.map((client: any) => (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedClientProfile(client)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-slate-900">{client.clientId}</td>
                      <td className="p-3 font-semibold text-slate-800">{client.name}</td>
                      <td className="p-3 text-slate-600 font-mono">{client.phone}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {client.referralSource}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            client.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientProfile(client);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition inline-flex items-center gap-1"
                        >
                          <span>View 360°</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. QUICK BOOK MODAL */}
      {showQuickBook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Quick Book Session Slot</h3>
              </div>
              <button
                onClick={() => setShowQuickBook(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickBookSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Session Slot *
                </label>
                <select
                  value={bookForm.sessionId}
                  onChange={(e) => setBookForm({ ...bookForm, sessionId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Today's Slot --</option>
                  {todaySessions
                    .filter((s: any) => s.status !== 'COMPLETED')
                    .map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.startTime} - {s.endTime} | {s.title} ({s.bookings?.length || 0}/{s.maxCapacity})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Client *
                </label>
                <select
                  value={bookForm.clientId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const clientObj = allClients.find((c) => c.id === cId);
                    const activePkg = clientObj?.packages?.find((p: any) => p.status === 'ACTIVE');
                    setBookForm({
                      ...bookForm,
                      clientId: cId,
                      clientPackageId: activePkg?.id || '',
                    });
                  }}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Client --</option>
                  {allClients.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.clientId}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickBook(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. NEW CLIENT MODAL */}
      {showNewClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Register New Client</h3>
              </div>
              <button
                onClick={() => setShowNewClient(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewClientSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Referral Source
                  </label>
                  <select
                    value={clientForm.referralSource}
                    onChange={(e) => setClientForm({ ...clientForm, referralSource: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Walk-in">Walk-in</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Doctor Referral">Doctor Referral</option>
                    <option value="Member Referral">Member Referral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Specialist
                  </label>
                  <select
                    value={clientForm.assignedSpecialistId}
                    onChange={(e) => setClientForm({ ...clientForm, assignedSpecialistId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="">-- Choose Specialist --</option>
                    {allSpecialists.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewClient(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. LOG PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Log Payment &amp; Issue Receipt</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Client *
                </label>
                <select
                  value={paymentForm.clientId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const cObj = allClients.find((c) => c.id === cId);
                    const activePkg = cObj?.packages?.find((p: any) => p.status === 'ACTIVE');
                    setPaymentForm({
                      ...paymentForm,
                      clientId: cId,
                      clientPackageId: activePkg?.id || '',
                      amount: activePkg ? String(activePkg.pricePaid || '') : '',
                    });
                  }}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Client --</option>
                  {allClients.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.clientId}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="e.g. 24000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="BANK_TRANSFER">Bank IMPS/NEFT</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CLIENT 360 PROFILE PREVIEW MODAL */}
      {selectedClientProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                  {selectedClientProfile.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedClientProfile.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedClientProfile.status}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-500">
                    ID: {selectedClientProfile.clientId}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClientProfile(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Contact Details</span>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedClientProfile.phone}</span>
                  </div>
                  {selectedClientProfile.email && (
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedClientProfile.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Care Assignment</span>
                  <div className="text-slate-800 font-semibold">
                    Specialist:{' '}
                    <span className="text-emerald-700">
                      {selectedClientProfile.assignedSpecialist?.name || 'Not assigned'}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    Source: <span className="font-semibold text-slate-700">{selectedClientProfile.referralSource}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/dashboard/clients/${selectedClientProfile.id}`}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Open Full 360° Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setSelectedClientProfile(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
