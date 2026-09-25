'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PhoneCall, MessageSquare, ChevronLeft, MapPin, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setMessage('');
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/portal" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900">Contact AUREX Reception Desk</h1>
        <p className="text-xs text-slate-500">Reach our front desk staff directly via WhatsApp, Phone, or Message</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Contact Buttons */}
        <div className="space-y-4">
          <a
            href="https://wa.me/919876543210?text=Hi%20AUREX%2C%20I%20would%20like%20to%20inquire%20about%20my%20session%20schedule."
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Desk</h3>
              <p className="text-xs text-slate-600 mt-0.5">Instant chat with reception & specialist coordinator</p>
            </div>
          </a>

          <a
            href="tel:+919800033333"
            className="p-5 rounded-2xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Direct Front Desk Call</h3>
              <p className="text-xs text-slate-600 mt-0.5">+91 98000 33333 (07:00 AM – 09:00 PM)</p>
            </div>
          </a>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Centre Location</h3>
            <div className="flex items-start gap-3 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>AUREX Clinical Exercise Centre, DLF Golf Course Road, Sector 42, Gurugram, Haryana</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>support@aurex.com</span>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Send Direct Request</h2>

          {sent && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your message has been delivered to reception!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500">
                <option>Session Reschedule Request</option>
                <option>Package Freeze / Medical Hold</option>
                <option>Specialist Clinical Query</option>
                <option>Billing / Receipt Assistance</option>
                <option>General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="Type your query or request for the reception desk..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
