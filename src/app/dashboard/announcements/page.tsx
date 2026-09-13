'use client';

import React, { useState } from 'react';
import { Bell, PlusCircle, Calendar, Sparkles, Check, X } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      title: 'Facility Sanitization & Deep Clean Schedule',
      content: 'Clinical rehab floor and barbell zone undergoing medical sterilization this Sunday at 8:00 PM.',
      date: '13/09/2026',
      author: 'Owner',
    },
    {
      id: '2',
      title: 'New McGill Big 3 Protocol Rollout',
      content: 'All specialists to use the standardized assessment form for lumbar stability evaluations starting this week.',
      date: '10/09/2026',
      author: 'Dr. Raghav Mehta',
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncements([
      {
        id: Date.now().toString(),
        title: form.title,
        content: form.content,
        date: '13/09/2026',
        author: 'Admin',
      },
      ...announcements,
    ]);
    setShowAdd(false);
    setForm({ title: '', content: '' });
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Clinic Announcements & Bulletins</h1>
          <p className="text-xs text-slate-500">Internal notice board for specialists, managers, and desk operations</p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Post Announcement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                {item.title}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
              Posted by: <span className="text-slate-700">{item.author}</span>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-[#1e3a8a] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                Post Announcement
              </span>
              <button onClick={() => setShowAdd(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Change for Dr. Arjun Verma"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type bulletin text..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3.5 py-1.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-xs font-bold shadow transition"
                >
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
