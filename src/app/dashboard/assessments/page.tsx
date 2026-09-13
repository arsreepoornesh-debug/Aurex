'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  PlusCircle, 
  FileHeart, 
  Stethoscope, 
  Search, 
  FileSpreadsheet, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  HeartPulse, 
  ShieldCheck, 
  Sparkles, 
  Printer, 
  Calendar,
  Check,
  X
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLimit, setShowLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadData() {
    setLoading(true);
    try {
      const [aRes, cRes, sRes] = await Promise.all([
        fetch('/api/assessments'),
        fetch('/api/clients'),
        fetch('/api/specialists'),
      ]);
      const aData = await aRes.json();
      const cData = await cRes.json();
      const sData = await sRes.json();

      setAssessments(Array.isArray(aData) ? aData : []);
      setClients(Array.isArray(cData) ? cData : []);
      setSpecialists(Array.isArray(sData) ? sData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const FORM_TEMPLATES = [
    {
      title: 'Initial Clinical Assessment',
      type: 'INITIAL',
      icon: Stethoscope,
      color: 'from-blue-600 to-indigo-700',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Complete medical intake, vitals, mobility & exercise prescription',
    },
    {
      title: 'PAR-Q+ Medical Clearance',
      type: 'INITIAL',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-700',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Pre-exercise medical flags, cardiac screening & clearance',
    },
    {
      title: 'McGill Big 3 & Spine Stability',
      type: 'INITIAL',
      icon: Activity,
      color: 'from-amber-600 to-orange-700',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Lumbar endurance tests: Bird-dog, side plank, curl-up evaluation',
    },
    {
      title: 'Functional Movement Screen (FMS)',
      type: 'INITIAL',
      icon: HeartPulse,
      color: 'from-purple-600 to-violet-700',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: '7-point movement pattern, asymmetry & mobility grading',
    },
    {
      title: 'Progress Reassessment',
      type: 'REASSESSMENT',
      icon: ClipboardList,
      color: 'from-rose-600 to-pink-700',
      tagColor: 'bg-rose-100 text-rose-800 border-rose-200',
      desc: 'Mid-term strength, pain-reduction & biometric comparison',
    },
  ];

  // Filter
  const filteredAssessments = assessments.filter((a) => {
    const clientName = a.client?.name || '';
    const clientId = a.client?.clientId || '';
    const matchesSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || a.type === typeFilter;
    const matchesClient = clientFilter === 'ALL' || a.clientId === clientFilter;
    return matchesSearch && matchesType && matchesClient;
  });

  const totalPages = Math.ceil(filteredAssessments.length / showLimit) || 1;
  const paginatedAssessments = filteredAssessments.slice((currentPage - 1) * showLimit, currentPage * showLimit);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAssessments(filteredAssessments.map((a) => a.id));
    } else {
      setSelectedAssessments([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedAssessments.includes(id)) {
      setSelectedAssessments(selectedAssessments.filter((i) => i !== id));
    } else {
      setSelectedAssessments([...selectedAssessments, id]);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileHeart className="w-5 h-5 text-emerald-600" />
            Clinical Assessment Forms & Medical Intake
          </h1>
          <p className="text-xs text-slate-500">
            Standardized clinical forms, PAR-Q+ screening, FMS evaluations, and exercise prescriptions
          </p>
        </div>

        <Link
          href="/dashboard/assessments/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Fill Assessment Form</span>
        </Link>
      </div>

      {/* 1. CLINICAL FORM TEMPLATES QUICK LAUNCHER */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Clinical Intake & Evaluation Form Templates
          </span>
          <span className="text-[11px] text-slate-400">Click any form template to start evaluation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {FORM_TEMPLATES.map((tmpl, idx) => (
            <Link
              key={idx}
              href={`/dashboard/assessments/new?type=${tmpl.type}`}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group flex flex-col justify-between gap-3"
            >
              <div>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tmpl.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-2.5`}>
                  <tmpl.icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition">
                  {tmpl.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{tmpl.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-bold text-emerald-600">
                <span>Launch Form</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. FILTER BAR (Dark Navy #1e3a8a) */}
      <div className="bg-[#1e3a8a] text-white p-3 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 items-center text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 shrink-0">Show</span>
            <select
              value={showLimit}
              onChange={(e) => {
                setShowLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none"
            >
              <option value={5} className="text-slate-900">5</option>
              <option value={10} className="text-slate-900">10</option>
              <option value={25} className="text-slate-900">25</option>
            </select>
          </div>

          <div>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none truncate"
            >
              <option value="ALL" className="text-slate-900">—All Clients—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-900">
                  {c.name} ({c.clientId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none"
            >
              <option value="ALL" className="text-slate-900">—All Evaluation Types—</option>
              <option value="INITIAL" className="text-slate-900">Initial Clinical Assessment</option>
              <option value="REASSESSMENT" className="text-slate-900">Reassessment / Mid-Term Review</option>
              <option value="PROGRESS_REVIEW" className="text-slate-900">Progress Review</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search Client, AUREX ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded pl-7 pr-2.5 py-1 text-white placeholder-slate-300 text-xs outline-none focus:bg-white/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-2 top-1.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. ASSESSMENTS TABLE (Blue Header #1e40af) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1e40af] text-white font-bold uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedAssessments.length === filteredAssessments.length && filteredAssessments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-10"># ↕</th>
                <th className="py-2.5 px-3">Client Name ↕</th>
                <th className="py-2.5 px-3">AUREX ID</th>
                <th className="py-2.5 px-3">Assessment Type</th>
                <th className="py-2.5 px-3">Evaluation Date ↕</th>
                <th className="py-2.5 px-3">Specialist</th>
                <th className="py-2.5 px-3">Clinical Diagnosis / Goal</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Loading clinical evaluation records...
                  </td>
                </tr>
              ) : paginatedAssessments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No clinical assessment records found. Click "+ Fill Assessment Form" above to record one.
                  </td>
                </tr>
              ) : (
                paginatedAssessments.map((a, idx) => {
                  const globalIdx = (currentPage - 1) * showLimit + idx + 1;
                  const isSelected = selectedAssessments.includes(a.id);
                  let focus = 'General Clinical Screening';
                  try {
                    const g = JSON.parse(a.goals);
                    if (g.primaryGoal) focus = g.primaryGoal;
                  } catch {}

                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(a.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-500 font-semibold">{globalIdx}</td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/dashboard/clients/${a.clientId}`}
                          className="font-bold text-[#3b82f6] hover:underline hover:text-blue-700"
                        >
                          {a.client?.name}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">{a.client?.clientId}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          {a.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">{formatDate(a.date)}</td>
                      <td className="py-3 px-3 text-slate-800 font-medium">
                        {a.specialist?.name || 'Assigned Specialist'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{focus}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/dashboard/assessments/${a.id}`}
                            className="px-2.5 py-1 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-[11px] font-bold shadow-sm transition"
                          >
                            View Report
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * showLimit + (filteredAssessments.length ? 1 : 0)}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(currentPage * showLimit, filteredAssessments.length)}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredAssessments.length}</span> entries
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
