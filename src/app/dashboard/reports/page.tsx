'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Users,
  Calendar,
  Download,
  ShieldAlert,
  PieChart,
  Activity,
  Layers,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { canViewReports } from '@/lib/rbac';

export default function ReportsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';
  const isAllowed = canViewReports(userRole);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    if (!isAllowed) return;
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [isAllowed]);

  function exportToCSV() {
    if (!data) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Category,Metric,Value\r\n';
    csvContent += `Clients,Total Clients,${data.clientMetrics?.total}\r\n`;
    csvContent += `Clients,Active Clients,${data.clientMetrics?.active}\r\n`;
    csvContent += `Financials,Total Gross Revenue,${data.financialMetrics?.totalRevenue}\r\n`;
    csvContent += `Financials,Net Collections,${data.financialMetrics?.netRevenue}\r\n`;
    csvContent += `Financials,Pending Receivables,${data.financialMetrics?.totalPendingBalance}\r\n`;
    csvContent += `CRM,Conversion Rate,${data.leadMetrics?.conversionRate}%\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AUREX_Clinical_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (!isAllowed) {
    return (
      <div>
        <Header title="Reports & Financial Analytics" subtitle="Access Restricted" />
        <div className="p-12 max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">RBAC Access Restricted</h2>
          <p className="text-xs text-slate-400">
            Financial reports, revenue analysis, and utilization analytics are accessible only to Owner and Manager roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Reports & Financial Analytics"
        subtitle="Revenue analytics, slot utilization heatmaps, client growth, and acquisition velocity"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top Header Actions */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Internal executive management metrics (Owner & Manager Level).
          </p>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Analytics (CSV)</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Top Financial Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="clinical-card p-5 border-emerald-500/30 bg-emerald-950/10">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Gross Revenue
                </span>
                <span className="text-2xl font-black text-emerald-300 block mt-2 font-mono">
                  {formatCurrency(data?.financialMetrics?.totalRevenue)}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Total collections recorded</p>
              </div>

              <div className="clinical-card p-5 border-teal-500/30 bg-teal-950/10">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Net Collections
                </span>
                <span className="text-2xl font-black text-teal-300 block mt-2 font-mono">
                  {formatCurrency(data?.financialMetrics?.netRevenue)}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">After deduction of refunds</p>
              </div>

              <div className="clinical-card p-5 border-amber-500/30 bg-amber-950/10">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Pending Receivables
                </span>
                <span className="text-2xl font-black text-amber-300 block mt-2 font-mono">
                  {formatCurrency(data?.financialMetrics?.totalPendingBalance)}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Outstanding package balances</p>
              </div>

              <div className="clinical-card p-5 border-blue-500/30 bg-blue-950/10">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Lead Conversion Rate
                </span>
                <span className="text-2xl font-black text-blue-300 block mt-2 font-mono">
                  {data?.leadMetrics?.conversionRate || 0}%
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  {data?.leadMetrics?.convertedLeads} / {data?.leadMetrics?.totalLeads} Converted
                </p>
              </div>
            </div>

            {/* Section: Slot Utilisation Heatmap */}
            <div className="clinical-card p-6">
              <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Session Slot Utilisation Heatmap
              </h2>

              <div className="space-y-4">
                {data?.slotUtilization?.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{item.slot}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {item.filled} / {item.capacity} Clients ({item.utilizationRate}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.utilizationRate >= 100
                            ? 'bg-rose-500'
                            : item.utilizationRate >= 75
                            ? 'bg-emerald-400'
                            : item.utilizationRate >= 50
                            ? 'bg-teal-400'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, item.utilizationRate)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Payment Modes & Lead Acquisition Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div className="clinical-card p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Collections by Payment Mode
                </h3>

                <div className="space-y-3">
                  {Object.entries(data?.financialMetrics?.paymentMethodsBreakdown || {}).map(
                    ([method, amount]: any) => (
                      <div
                        key={method}
                        className="p-3 rounded-xl bg-[#0E1524] border border-[#1F2C42] flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white">{method}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Lead Acquisition Sources */}
              <div className="clinical-card p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-blue-400" />
                  Lead Acquisition Source Breakdown
                </h3>

                <div className="space-y-3">
                  {Object.entries(data?.leadMetrics?.sourceBreakdown || {}).map(
                    ([source, count]: any) => (
                      <div
                        key={source}
                        className="p-3 rounded-xl bg-[#0E1524] border border-[#1F2C42] flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white">{source}</span>
                        <span className="font-mono font-bold text-blue-400">{count} Inquiries</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
