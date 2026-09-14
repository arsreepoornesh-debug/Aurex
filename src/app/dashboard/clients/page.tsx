'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  FileSpreadsheet, 
  Mail, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  X, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Calendar,
  Phone,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLimit, setShowLimit] = useState(10);
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [packageFilter, setPackageFilter] = useState('ALL');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  // Deletion States
  const [clientToDelete, setClientToDelete] = useState<any | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    referralSource: 'Doctor Referral',
    status: 'ACTIVE',
    assignedSpecialistId: '',
  });

  function showMessage(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  }

  async function loadData() {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/specialists'),
      ]);
      const cData = await cRes.json();
      const sData = await sRes.json();
      setClients(Array.isArray(cData) ? cData : []);
      setSpecialists(Array.isArray(sData) ? sData : []);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      });

      if (res.ok) {
        setShowNewModal(false);
        setClientForm({
          name: '',
          phone: '',
          email: '',
          dob: '',
          gender: 'Male',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          referralSource: 'Doctor Referral',
          status: 'ACTIVE',
          assignedSpecialistId: '',
        });
        loadData();
        showMessage('success', 'Client registered successfully!');
      } else {
        const err = await res.json();
        showMessage('error', err.error || 'Failed to register client');
      }
    } catch (err) {
      showMessage('error', 'Error registering client');
    }
  };

  const handleDeleteSingleClient = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients/${clientToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', data.message || `Client ${clientToDelete.name} removed successfully`);
        setSelectedClients((prev) => prev.filter((id) => id !== clientToDelete.id));
        setClientToDelete(null);
        loadData();
      } else {
        showMessage('error', data.error || 'Failed to remove client');
      }
    } catch (err) {
      showMessage('error', 'Error removing client record');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedClients.length === 0) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedClients }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', data.message || `${selectedClients.length} clients removed successfully`);
        setSelectedClients([]);
        setShowBulkDeleteModal(false);
        loadData();
      } else {
        showMessage('error', data.error || 'Failed to remove selected clients');
      }
    } catch (err) {
      showMessage('error', 'Error removing selected clients');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedClients(filteredClients.map((c) => c.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter((i) => i !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  // Filter
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = genderFilter === 'ALL' || c.gender === genderFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesGender && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClients.length / showLimit) || 1;
  const paginatedClients = filteredClients.slice((currentPage - 1) * showLimit, currentPage * showLimit);

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/80 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Search Bar (full width) */}
      <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <select className="bg-slate-100 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-700 font-bold outline-none">
          <option value="ALL">All Categories</option>
          <option value="ACTIVE">Active Clients</option>
          <option value="LEAD">Leads</option>
        </select>
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search for Client Name, Contact No., Email, Client ID (AUR-YYYY-XXXX)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Client</span>
        </button>
      </div>

      {/* Filter Row Header (Dark Navy #1e3a8a) */}
      <div className="bg-[#1e3a8a] text-white p-3 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 items-center text-xs">
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

          {/* Gender */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">—Select Gender—</option>
              <option value="Male" className="text-slate-900">Male</option>
              <option value="Female" className="text-slate-900">Female</option>
            </select>
          </div>

          {/* Packages */}
          <div>
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">—All Packages—</option>
              <option value="SEMI_PRIVATE" className="text-slate-900">Semi-Private Packages</option>
              <option value="PREMIUM" className="text-slate-900">Premium Packages</option>
            </select>
          </div>

          {/* Service Types */}
          <div>
            <select
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">—All Service Types—</option>
              <option value="SP" className="text-slate-900">Semi-Private (4:1)</option>
              <option value="PT" className="text-slate-900">Premium (1:1)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-2.5 py-1 text-white text-xs outline-none focus:bg-white/20"
            >
              <option value="ALL" className="text-slate-900">—All Client Statuses—</option>
              <option value="ACTIVE" className="text-slate-900">Active</option>
              <option value="LEAD" className="text-slate-900">Lead</option>
              <option value="INACTIVE" className="text-slate-900">Inactive</option>
              <option value="EXPIRED" className="text-slate-900">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Broadcasting SMS to ${selectedClients.length || 'all'} clients`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📢 Bulk SMS</span>
          </button>

          <button
            onClick={() => alert(`Sending WhatsApp to ${selectedClients.length || 'all'} clients`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition"
          >
            <span>📱 Bulk WhatsApp</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button
            onClick={() => alert(`Broadcasting Email to ${selectedClients.length || 'all'} clients`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0f766e] hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>✉ Bulk Email</span>
          </button>

          {/* Bulk Remove Button */}
          {selectedClients.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition animate-pulse"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Selected ({selectedClients.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Clients list to Excel...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel 📊</span>
          </button>
        </div>
      </div>

      {/* Table (Blue Header #1e40af) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1e40af] text-white font-bold uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">Client ID ↕</th>
                <th className="py-2.5 px-2 text-center">Photo</th>
                <th className="py-2.5 px-3">Client Name ↕</th>
                <th className="py-2.5 px-3">Contact No.</th>
                <th className="py-2.5 px-3">Gender ↕</th>
                <th className="py-2.5 px-3">Registration ↕</th>
                <th className="py-2.5 px-3">Package ↕</th>
                <th className="py-2.5 px-3">Expiration ↕</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Specialist</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-slate-400">
                    Loading clients...
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-slate-400">
                    No client records found.
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client, idx) => {
                  const isSelected = selectedClients.includes(client.id);
                  const activePkg = client.packages?.[0];
                  const expiryStr = activePkg?.expiryDate ? formatDate(activePkg.expiryDate) : '—';

                  return (
                    <tr
                      key={client.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/60' : idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(client.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{client.clientId}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center mx-auto text-xs">
                          {client.name[0]}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="font-bold text-[#3b82f6] hover:underline hover:text-blue-700"
                        >
                          {client.name}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{client.phone}</td>
                      <td className="py-3 px-3 text-slate-600">{client.gender || 'Male'}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{formatDate(client.registrationDate)}</td>
                      <td className="py-3 px-3">
                        {activePkg ? (
                          <div>
                            <span className="font-semibold text-slate-800 block truncate max-w-[140px]">
                              {activePkg.name}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-mono font-bold">
                              {activePkg.sessionsRemaining}/{activePkg.totalSessions} Left
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No package</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{expiryStr}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            client.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : client.status === 'LEAD'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {client.assignedSpecialist?.name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Profile Button (Green #10b981) */}
                          <Link
                            href={`/dashboard/clients/${client.id}`}
                            className="px-2.5 py-1 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-[11px] font-bold shadow-sm transition"
                          >
                            Profile
                          </Link>

                          {/* Action Button */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveActionMenu(activeActionMenu === client.id ? null : client.id)}
                              className="px-2 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                            >
                              <span>⚙</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {activeActionMenu === client.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-left">
                                <Link
                                  href={`/dashboard/clients/${client.id}`}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium block"
                                  onClick={() => setActiveActionMenu(null)}
                                >
                                  View 360° Profile
                                </Link>
                                <Link
                                  href={`/dashboard/assessments/new?clientId=${client.id}`}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium block"
                                  onClick={() => setActiveActionMenu(null)}
                                >
                                  Clinical Assessment
                                </Link>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenu(null);
                                    setClientToDelete(client);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 font-bold flex items-center gap-1.5 transition text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  <span>Remove Client</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Direct Quick Delete Button */}
                          <button
                            type="button"
                            title="Remove Client"
                            onClick={() => setClientToDelete(client)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * showLimit + (filteredClients.length ? 1 : 0)}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(currentPage * showLimit, filteredClients.length)}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredClients.length}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
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

      {/* Confirmation Modal: Single Client Delete */}
      {clientToDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Remove Client Record</span>
              </div>
              <button
                onClick={() => setClientToDelete(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed">
                Are you sure you want to permanently remove client{' '}
                <strong className="text-slate-950 font-black">{clientToDelete.name}</strong> (
                <code className="text-red-600 font-bold">{clientToDelete.clientId}</code>)?
              </p>
              <div className="p-3 bg-red-50/80 rounded-lg border border-red-200/80 text-[11px] text-red-800 space-y-1">
                <p className="font-bold flex items-center gap-1 text-red-900">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  This action is permanent and cannot be undone:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-red-700 pl-1">
                  <li>All assigned packages & remaining sessions will be deleted.</li>
                  <li>All session bookings and attendance records will be removed.</li>
                  <li>Payment logs, clinical assessments, and notes will be wiped.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setClientToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSingleClient}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Remove Client</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Bulk Delete */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Remove Multiple Clients</span>
              </div>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed">
                You have selected <strong className="text-red-600 font-black">{selectedClients.length}</strong> client(s) for permanent deletion.
              </p>
              <div className="p-3 bg-red-50/80 rounded-lg border border-red-200/80 text-[11px] text-red-800 space-y-1">
                <p className="font-bold text-red-900">
                  All associated packages, bookings, payments, and clinical notes for these clients will be permanently purged.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove {selectedClients.length} Clients</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Client Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Register New Clinical Client
              </span>
              <button onClick={() => setShowNewModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Puneesh"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={clientForm.gender}
                    onChange={(e) => setClientForm({ ...clientForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Referral Source</label>
                  <select
                    value={clientForm.referralSource}
                    onChange={(e) => setClientForm({ ...clientForm, referralSource: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="Doctor Referral">Doctor Referral</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Website">Website</option>
                    <option value="Google">Google</option>
                    <option value="Referral">Client Referral</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Specialist</label>
                  <select
                    value={clientForm.assignedSpecialistId}
                    onChange={(e) => setClientForm({ ...clientForm, assignedSpecialistId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Unassigned --</option>
                    {specialists.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Plot / Flat, Sector, City"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow transition"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
