'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Sparkles, 
  History, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';

const QUICK_RESPONSE_TAGS = [
  'Call not picked',
  'Not reachable',
  'Number Switched Off',
  'Invalid Number',
  'Out of station',
  'Location too far',
  'Price too high',
  'Joined another gym',
  'Timing issue',
  'Not interested',
  'Will join later',
];

export default function NewInquiryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [selectedLeadForHistory, setSelectedLeadForHistory] = useState<any | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [areaAddress, setAreaAddress] = useState('');
  const [source, setSource] = useState('Instagram');
  const [service, setService] = useState('AUREX Semi-Private');
  const [status, setStatus] = useState('Pending');
  const [convertibility, setConvertibility] = useState('Warm');
  const [trialDate, setTrialDate] = useState('');
  const [scheduleFollowUpDate, setScheduleFollowUpDate] = useState('2026-09-14');
  const [scheduleFollowUpTime, setScheduleFollowUpTime] = useState('06:00 AM');
  const [attendedBy, setAttendedBy] = useState('Admin');
  const [inquiryFor, setInquiryFor] = useState('Medical Fitness & Clinical Rehab');
  const [responseTag, setResponseTag] = useState('');
  const [responseFeedback, setResponseFeedback] = useState('');

  useEffect(() => {
    // Load recent inquiries to display in history selector
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentLeads(data.slice(0, 8));
        }
      })
      .catch(console.error);
  }, []);

  const handleTagClick = (tag: string) => {
    setResponseTag(tag);
    if (!responseFeedback.includes(tag)) {
      setResponseFeedback(responseFeedback ? `${responseFeedback}, ${tag}` : tag);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !contactNo) {
      alert('First Name and Contact Number are required!');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const followUpDateTime = scheduleFollowUpDate
        ? `${scheduleFollowUpDate}T${scheduleFollowUpTime.includes('PM') ? '18:00:00' : '09:00:00'}`
        : null;

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          phone: contactNo,
          alternatePhone: alternatePhone || null,
          email: email || null,
          gender,
          stage: status === 'Converted' ? 'CONVERTED' : 'NEW_LEAD',
          convertibility,
          source,
          service,
          trialDate: trialDate || null,
          scheduleFollowUp: followUpDateTime,
          attendedBy,
          response: responseTag || null,
          responseNote: responseFeedback || null,
          notes: `${areaAddress ? `Address: ${areaAddress}. ` : ''}Inquiry For: ${inquiryFor}`,
        }),
      });

      if (res.ok) {
        alert('Inquiry created successfully!');
        router.push('/dashboard/crm');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create inquiry');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/crm"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              Create New Inquiry / Lead
            </h1>
            <p className="text-xs text-slate-500">Capture lead details, qualification, and follow-up timeline</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/crm"
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 rounded text-xs font-bold text-white bg-[#1e3a8a] hover:bg-[#1e40af] shadow transition flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            {loading ? 'Saving...' : 'Save Inquiry'}
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Navy Header Bar */}
        <div className="bg-[#1e3a8a] px-5 py-3 text-white flex items-center justify-between">
          <span className="font-bold text-sm tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Create new Inquiry
          </span>
          <span className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold">
            AUREX Clinical Intake
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Schedule follow-up time</label>
                <div className="relative">
                  <input
                    type="text"
                    value={scheduleFollowUpTime}
                    onChange={(e) => setScheduleFollowUpTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
                  />
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Convertibility *</label>
                <select
                  value={convertibility}
                  onChange={(e) => setConvertibility(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition font-semibold"
                >
                  <option value="Hot">🔥 Hot (Ready to join)</option>
                  <option value="Warm">⚡ Warm (Interested)</option>
                  <option value="Cold">❄️ Cold (Browsing)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Response / feedback *</label>
              <textarea
                rows={3}
                required
                placeholder="Log client discussion, concerns, clinical goals..."
                value={responseFeedback}
                onChange={(e) => setResponseFeedback(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>

            {/* Quick response tags below */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick Response Tags (click to add):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_RESPONSE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition border ${
                      responseTag === tag
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trial date</label>
                <input
                  type="date"
                  value={trialDate}
                  onChange={(e) => setTrialDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Source of Inquiry *</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Website">Website</option>
                  <option value="Google">Google</option>
                  <option value="Referral">Doctor / Referral</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service *</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
                >
                  <option value="AUREX Semi-Private">AUREX Semi-Private</option>
                  <option value="AUREX Premium (1:1)">AUREX Premium (1:1)</option>
                  <option value="Clinical Assessment">Clinical Assessment</option>
                  <option value="Consultation">Doctor Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
                >
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact No. *</label>
                <div className="flex">
                  <span className="bg-slate-200 border border-r-0 border-slate-300 px-2 py-2 text-xs font-bold text-slate-700 rounded-l">
                    +91 IN
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="8874402300"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-r px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alternate Contact No.</label>
                <div className="flex">
                  <span className="bg-slate-200 border border-r-0 border-slate-300 px-2 py-2 text-xs font-bold text-slate-700 rounded-l">
                    +91 IN
                  </span>
                  <input
                    type="text"
                    placeholder="Optional phone"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-r px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Area / Address</label>
              <input
                type="text"
                placeholder="e.g. Sector 29, Gurgaon"
                value={areaAddress}
                onChange={(e) => setAreaAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (Scheduling & Staff Assignment) */}
        <div className="p-6 pt-2 border-t border-slate-200 bg-slate-50/50 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Schedule follow-up *</label>
                <input
                  type="date"
                  value={scheduleFollowUpDate}
                  onChange={(e) => setScheduleFollowUpDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attended by *</label>
                <select
                  value={attendedBy}
                  onChange={(e) => setAttendedBy(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:border-blue-500 outline-none font-medium"
                >
                  <option value="Admin">Admin</option>
                  <option value="Dr. Raghav Mehta">Dr. Raghav Mehta (Clinical Physiologist)</option>
                  <option value="Priya Sharma">Priya Sharma (Rehab Specialist)</option>
                  <option value="Dr. Arjun Verma">Dr. Arjun Verma (Sports Medicine)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry for *</label>
              <select
                value={inquiryFor}
                onChange={(e) => setInquiryFor(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:border-blue-500 outline-none"
              >
                <option value="Medical Fitness & Clinical Rehab">Medical Fitness & Clinical Rehab</option>
                <option value="Spine & Lower Back Rehab">Spine & Lower Back Rehab</option>
                <option value="Post-Surgical Exercise Program">Post-Surgical Exercise Program</option>
                <option value="Cardiometabolic Exercise Training">Cardiometabolic Exercise Training</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-blue-600 pt-1">
              <Link href="/dashboard/specialists" className="hover:underline">
                + Add specialist / employee with full details
              </Link>
              <Link href="/dashboard/packages/semi-private" className="hover:underline">
                + Add package
              </Link>
            </div>
          </div>

          {/* RIGHT BOTTOM: Inquiry update history */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-600" />
                Inquiry update history
              </span>
              <select
                onChange={(e) => {
                  const lead = recentLeads.find((l) => l.id === e.target.value);
                  setSelectedLeadForHistory(lead || null);
                }}
                className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700"
              >
                <option value="">Select an Inquiry to check history</option>
                {recentLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.phone})
                  </option>
                ))}
              </select>
            </div>

            {selectedLeadForHistory ? (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900">{selectedLeadForHistory.name}</div>
                <div className="text-[11px] text-slate-500">
                  Source: <span className="font-semibold text-slate-700">{selectedLeadForHistory.source}</span> · Stage:{' '}
                  <span className="font-semibold text-emerald-600">{selectedLeadForHistory.stage}</span>
                </div>
                <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto">
                  {selectedLeadForHistory.followUps?.length > 0 ? (
                    selectedLeadForHistory.followUps.map((fu: any) => (
                      <div key={fu.id} className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px]">
                        <div className="font-medium text-slate-800">{fu.notes}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(fu.followUpDate).toLocaleDateString()} by {fu.loggedByUser?.name || 'Admin'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 py-2 italic">No previous follow-ups logged.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                Please select an existing inquiry above to inspect past qualification timeline.
              </p>
            )}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link
            href="/dashboard/crm"
            className="px-4 py-2 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded text-xs font-bold text-white bg-[#1e3a8a] hover:bg-[#1e40af] shadow transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {loading ? 'Saving...' : 'Submit Inquiry'}
          </button>
        </div>
      </form>
    </div>
  );
}
