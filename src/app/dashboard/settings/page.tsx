'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    clinicName: 'AUREX Medical Fitness & Clinical Exercise',
    invoicePrefix: 'INV-AUR-',
    clientIdPrefix: 'AUR-2026-',
    semiPrivateCapacity: 4,
    premiumCapacity: 1,
    leadExpiryNoticeDays: 7,
    lowSessionsThreshold: 2,
    timezone: 'Asia/Kolkata (IST)',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Software & Clinic Settings</h1>
          <p className="text-xs text-slate-500">Configure business rules, capacity limits, prefix formats, and clinical parameters</p>
        </div>

        {saved && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-4 h-4" /> Configuration Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-[#1e3a8a] text-white px-5 py-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-400" />
          Master Business Configuration
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinic Legal / Brand Name</label>
            <input
              type="text"
              value={settings.clinicName}
              onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Invoice Number Prefix</label>
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client ID Format</label>
              <input
                type="text"
                value={settings.clientIdPrefix}
                onChange={(e) => setSettings({ ...settings, clientIdPrefix: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Semi-Private Max Capacity (Hard Constraint)</label>
              <input
                type="number"
                value={settings.semiPrivateCapacity}
                onChange={(e) => setSettings({ ...settings, semiPrivateCapacity: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Premium 1:1 Max Capacity</label>
              <input
                type="number"
                value={settings.premiumCapacity}
                onChange={(e) => setSettings({ ...settings, premiumCapacity: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Renewal Expiry Warning (Days)</label>
              <input
                type="number"
                value={settings.leadExpiryNoticeDays}
                onChange={(e) => setSettings({ ...settings, leadExpiryNoticeDays: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Low Session Alert Threshold</label>
              <input
                type="number"
                value={settings.lowSessionsThreshold}
                onChange={(e) => setSettings({ ...settings, lowSessionsThreshold: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">System Timezone</label>
            <input
              type="text"
              readOnly
              value={settings.timezone}
              className="w-full bg-slate-100 border border-slate-200 rounded p-2 text-slate-600 font-mono cursor-not-allowed"
            />
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
