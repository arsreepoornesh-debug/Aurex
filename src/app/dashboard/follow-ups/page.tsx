'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PhoneCall, 
  Search, 
  FileSpreadsheet, 
  Mail, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  PlusCircle,
  X,
  Check
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLimit, setShowLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [selectedFollowUps, setSelectedFollowUps] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: 'CALL',
    contactType: 'LEAD',
    name: '',
    phone: '',
    notes: '',
    followUpDate: '2026-09-14',
  });

  async function fetchFollowUps() {
    setLoading(true);
    try {
      const res = await fetch('/api/follow-ups');
      const data = await res.json();
      setFollowUps(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFollowUps(filteredFollowUps.map((f) => f.id));
    } else {
      setSelectedFollowUps([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedFollowUps.includes(id)) {
      setSelectedFollowUps(selectedFollowUps.filter((i) => i !== id));
    } else {
      setSelectedFollowUps([...selectedFollowUps, id]);
    }
  };

  const handleToggleComplete = async (id: string, currentCompleted: boolean) => {
    try {
      const res = await fetch('/api/follow-ups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !currentCompleted }),
      });
      if (res.ok) {
        fetchFollowUps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic
  const filteredFollowUps = followUps.filter((f) => {
    const personName = f.client?.name || f.lead?.name || '';
    const personPhone = f.client?.phone || f.lead?.phone || '';
    const matchesSearch =
      personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      personPhone.includes(searchTerm) ||
      (f.notes && f.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const isRenewal = !f.lead && !!f.client;
    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'INQUIRY' && f.lead) ||
      (typeFilter === 'RENEWAL' && isRenewal);

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredFollowUps.length / showLimit) || 1;
  const paginatedFollowUps = filteredFollowUps.slice((currentPage - 1) * showLimit, currentPage * showLimit);

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Follow-ups Queue</h1>
          <p className="text-xs text-slate-500">Track client inquiries, renewal outreach, and pending callback schedules</p>
        </div>

        <Link
          href="/dashboard/crm/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Followup</span>
        </Link>
      </div>

      {/* 1. FILTER BAR (Dark Navy #1e3a8a) */}
      <div className="bg-[#1e3a8a] text-white p-3 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 items-center text-xs">
          {/* Show limit */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 shrink-0">Show</span>
            <select
              value={showLimit}
              onChange={(e) => {
                setShowLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value={5} className="text-slate-900">5</option>
              <option value={10} className="text-slate-900">10</option>
              <option value={25} className="text-slate-900">25</option>
              <option value={50} className="text-slate-900">50</option>
            </select>
          </div>

          {/* Employee filter */}
          <div>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">—All employee—</option>
              <option value="Admin" className="text-slate-900">Admin</option>
              <option value="Dr. Raghav Mehta" className="text-slate-900">Dr. Raghav Mehta</option>
              <option value="Priya Sharma" className="text-slate-900">Priya Sharma</option>
            </select>
          </div>

          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">—All type—</option>
              <option value="INQUIRY" className="text-slate-900">Inquiry</option>
              <option value="RENEWAL" className="text-slate-900">Renewal</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">— Date range —</option>
              <option value="TODAY" className="text-slate-900">Today</option>
              <option value="THIS_WEEK" className="text-slate-900">This Week</option>
            </select>
          </div>

          {/* Search */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search Name, Phone, Notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded pl-7 pr-2.5 py-1 text-white placeholder-slate-300 text-xs outline-none focus:bg-white/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-2 top-1.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. BULK ACTION BUTTONS & EXPORT */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Broadcasting Follow-up SMS`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📢 BULK SMS</span>
          </button>

          <button
            onClick={() => alert(`Broadcasting WhatsApp follow-up reminders`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📱 BULK WHATSAPP</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button
            onClick={() => alert(`Sending follow-up emails`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0f766e] hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>✉ BULK EMAIL</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Follow-ups to Excel...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel export</span>
          </button>
        </div>
      </div>

      {/* 3. TABLE WITH BLUE HEADER (#1e40af) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1e40af] text-white font-bold uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedFollowUps.length === filteredFollowUps.length && filteredFollowUps.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-10"># ↕</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Name ↕</th>
                <th className="py-2.5 px-3">Contact No.</th>
                <th className="py-2.5 px-3">Follow-up date ↕</th>
                <th className="py-2.5 px-3">Last Follow-up date</th>
                <th className="py-2.5 px-3">Response / Feedback</th>
                <th className="py-2.5 px-3">Rep.</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    Loading follow-up queue...
                  </td>
                </tr>
              ) : paginatedFollowUps.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No follow-ups found for the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedFollowUps.map((item, idx) => {
                  const globalIdx = (currentPage - 1) * showLimit + idx + 1;
                  const isSelected = selectedFollowUps.includes(item.id);
                  const isLead = !!item.lead;
                  const personName = item.client?.name || item.lead?.name || 'Contact';
                  const personPhone = item.client?.phone || item.lead?.phone || '—';
                  const followUpDateStr = formatDate(item.followUpDate);
                  const lastFollowUpDateStr = formatDate(item.createdAt);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(item.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-500 font-semibold">{globalIdx}</td>
                      <td className="py-3 px-3">
                        {isLead ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Inquiry
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Renewal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {item.client ? (
                          <Link
                            href={`/dashboard/clients/${item.client.id}`}
                            className="font-bold text-[#3b82f6] hover:underline"
                          >
                            {personName}
                          </Link>
                        ) : (
                          <Link href={`/dashboard/crm/new`} className="font-bold text-[#3b82f6] hover:underline">
                            {personName}
                          </Link>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{personPhone}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{followUpDateStr}</td>
                      <td className="py-3 px-3 text-slate-500">{lastFollowUpDateStr}</td>
                      <td className="py-3 px-3">
                        <span className="text-slate-800 font-medium line-clamp-1">{item.notes}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {item.loggedByUser?.name || 'Admin'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Complete toggle */}
                          <button
                            onClick={() => handleToggleComplete(item.id, item.completed)}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                              item.completed
                                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>{item.completed ? 'Done' : 'Mark Done'}</span>
                          </button>

                          {/* Action button */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveActionMenu(activeActionMenu === item.id ? null : item.id)}
                              className="px-2 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                            >
                              <span>⚙</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {activeActionMenu === item.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left">
                                <Link
                                  href={`/dashboard/crm/new`}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium block"
                                >
                                  Edit Followup
                                </Link>
                              </div>
                            )}
                          </div>

                          {/* WhatsApp */}
                          {personPhone !== '—' && (
                            <a
                              href={`https://wa.me/91${personPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition shadow-sm"
                              title="Chat on WhatsApp"
                            >
                              <span className="text-[10px] font-bold">📱</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. FOOTER & PAGINATION */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * showLimit + (filteredFollowUps.length ? 1 : 0)}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(currentPage * showLimit, filteredFollowUps.length)}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredFollowUps.length}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded text-xs font-bold transition ${
                  currentPage === p
                    ? 'bg-[#1e40af] text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
