'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  FileSpreadsheet, 
  MessageSquare, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Calendar,
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  Trash2,
  Check
} from 'lucide-react';

export default function CRMInquiriesPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLimit, setShowLimit] = useState(10);
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  async function loadLeads() {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(filteredLeads.map((l) => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((i) => i !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleConvertToClient = async (leadId: string) => {
    if (!confirm('Convert this inquiry into a registered AUREX Client?')) return;
    try {
      const res = await fetch('/api/leads/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      if (res.ok) {
        const newClient = await res.json();
        alert(`Inquiry converted to Client ${newClient.name} (${newClient.clientId})!`);
        loadLeads();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to convert lead');
      }
    } catch (err) {
      alert('Error converting lead');
    }
  };

  // Filter logic
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'Pending' && l.stage !== 'CONVERTED' && l.stage !== 'LOST') ||
      (statusFilter === 'Converted' && l.stage === 'CONVERTED') ||
      (statusFilter === 'Contacted' && l.stage === 'CONTACTED');
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLeads.length / showLimit) || 1;
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * showLimit, currentPage * showLimit);

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Page Title & Top Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Pending Inquiries / Leads</h1>
          <p className="text-xs text-slate-500">Manage client acquisition pipeline, follow-ups, and conversion</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/crm/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Inquiry</span>
          </Link>
        </div>
      </div>

      {/* 1. FILTER BAR (Dark Navy Background #1e3a8a) */}
      <div className="bg-[#1e3a8a] text-white p-3 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 items-center text-xs">
          {/* Show Limit */}
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

          {/* Employee dropdown */}
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

          {/* Status dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">—All Inquiry Status—</option>
              <option value="Pending" className="text-slate-900">Pending</option>
              <option value="Contacted" className="text-slate-900">Contacted</option>
              <option value="Converted" className="text-slate-900">Converted</option>
            </select>
          </div>

          {/* Date range dropdown */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">— Date range —</option>
              <option value="TODAY" className="text-slate-900">Today</option>
              <option value="THIS_WEEK" className="text-slate-900">This Week</option>
              <option value="THIS_MONTH" className="text-slate-900">This Month</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search Name, Contact No., Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded pl-7 pr-2.5 py-1 text-white placeholder-slate-300 text-xs outline-none focus:bg-white/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-2 top-1.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. BULK ACTIONS & EXPORT ROW */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          {/* BULK SMS */}
          <button
            onClick={() => alert(`Broadcasting SMS to ${selectedLeads.length || 'all'} inquiries`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📢 BULK SMS</span>
          </button>

          {/* BULK WHATSAPP */}
          <button
            onClick={() => alert(`Triggering WhatsApp message to ${selectedLeads.length || 'all'} inquiries`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📱 BULK WHATSAPP</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* BULK EMAIL */}
          <button
            onClick={() => alert(`Sending Email to ${selectedLeads.length || 'all'} inquiries`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0f766e] hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>✉ BULK EMAIL</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Excel Export Button */}
          <button
            onClick={() => alert('Exporting Inquiries to Excel / CSV...')}
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
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-10"># ↕</th>
                <th className="py-2.5 px-3">Name ↕</th>
                <th className="py-2.5 px-3">Contact No.</th>
                <th className="py-2.5 px-3">For</th>
                <th className="py-2.5 px-3">Next follow-up ↕</th>
                <th className="py-2.5 px-3">Rep.</th>
                <th className="py-2.5 px-3">Status ↕</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Loading inquiries...
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No inquiries matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead, idx) => {
                  const globalIdx = (currentPage - 1) * showLimit + idx + 1;
                  const isSelected = selectedLeads.includes(lead.id);
                  const followUp = lead.followUps?.[0];
                  const followUpDateStr = lead.scheduleFollowUp
                    ? new Date(lead.scheduleFollowUp).toLocaleDateString()
                    : followUp
                    ? new Date(followUp.followUpDate).toLocaleDateString()
                    : '14/09/2026';

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(lead.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-500 font-semibold">{globalIdx}</td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/dashboard/crm/new`}
                          className="font-bold text-[#3b82f6] hover:underline hover:text-blue-700"
                        >
                          {lead.name}
                        </Link>
                        {lead.email && <div className="text-[10px] text-slate-400 truncate max-w-xs">{lead.email}</div>}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{lead.phone}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{lead.service || 'AUREX'}</span>
                        <span className="text-[10px] text-slate-400 block">{lead.source}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{followUpDateStr}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{lead.attendedBy || 'Admin'}</td>
                      <td className="py-3 px-3">
                        {lead.stage === 'CONVERTED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3" /> Converted
                          </span>
                        ) : lead.stage === 'CONTACTED' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Contacted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Action button */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveActionMenu(activeActionMenu === lead.id ? null : lead.id)}
                              className="px-2 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                            >
                              <span>⚙ Action</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {activeActionMenu === lead.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left">
                                {lead.stage !== 'CONVERTED' && (
                                  <button
                                    onClick={() => {
                                      setActiveActionMenu(null);
                                      handleConvertToClient(lead.id);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 font-bold flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Convert to Client
                                  </button>
                                )}
                                <Link
                                  href={`/dashboard/crm/new`}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium block"
                                >
                                  Edit / Log Follow-up
                                </Link>
                              </div>
                            )}
                          </div>

                          {/* WhatsApp button */}
                          <a
                            href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition shadow-sm"
                            title="Chat on WhatsApp"
                          >
                            <span className="text-[10px] font-bold">📱</span>
                          </a>
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
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * showLimit + (filteredLeads.length ? 1 : 0)}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(currentPage * showLimit, filteredLeads.length)}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredLeads.length}</span> entries
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
