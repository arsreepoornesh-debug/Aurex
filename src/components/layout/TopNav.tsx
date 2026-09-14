'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  ChevronDown, 
  Activity, 
  User, 
  LogOut, 
  ShieldCheck, 
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Users,
  Settings,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface DropdownItem {
  label: string;
  href: string;
  icon?: any;
  roleRestriction?: string[];
}

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'OWNER';

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const billingItems: DropdownItem[] = [
    { label: 'Semi-Private Session Bill', href: '/dashboard/payments?service=SEMI_PRIVATE', icon: CreditCard },
    { label: 'Premium Session Bill', href: '/dashboard/payments?service=PREMIUM', icon: DollarSign },
    { label: 'Deleted / Refunded Bills', href: '/dashboard/payments?status=REFUNDED', icon: Layers },
  ];

  const packageItems: DropdownItem[] = [
    { label: 'Semi-Private Packages', href: '/dashboard/packages/semi-private', icon: Package },
    { label: 'Premium Packages', href: '/dashboard/packages/premium', icon: Sparkles },
  ];

  const reportItems: DropdownItem[] = [
    { label: 'Client Reports', href: '/dashboard/reports?tab=clients', icon: Users, roleRestriction: ['RECEPTIONIST', 'MANAGER'] },
    { label: 'Attendance Reports', href: '/dashboard/reports?tab=attendance', icon: Calendar, roleRestriction: ['RECEPTIONIST', 'MANAGER'] },
    { label: 'Revenue Reports', href: '/dashboard/reports?tab=revenue', icon: DollarSign, roleRestriction: ['RECEPTIONIST', 'MANAGER'] },
    { label: 'Lead Reports', href: '/dashboard/reports?tab=leads', icon: FileText, roleRestriction: ['RECEPTIONIST', 'MANAGER'] },
    { label: 'Session Utilisation', href: '/dashboard/reports?tab=utilisation', icon: Activity, roleRestriction: ['RECEPTIONIST', 'MANAGER'] },
  ];

  const manageItems: DropdownItem[] = [
    { label: 'Mark Attendance', href: '/dashboard/attendance', icon: Calendar },
    { label: 'Expenses', href: '/dashboard/expenses', icon: DollarSign, roleRestriction: ['RECEPTIONIST', 'MANAGER'] },
    { label: 'Semi-Private Schedule', href: '/dashboard/schedules/semi-private', icon: Calendar },
    { label: 'Premium Schedule', href: '/dashboard/schedules/premium', icon: Sparkles },
    { label: 'Semi-Private Packages (Catalog)', href: '/dashboard/packages/semi-private', icon: Package },
    { label: 'Premium Packages (Catalog)', href: '/dashboard/packages/premium', icon: Sparkles },
    { label: 'Specialists', href: '/dashboard/specialists', icon: Users, roleRestriction: ['RECEPTIONIST'] },
    { label: 'Staff / Employee', href: '/dashboard/staff', icon: Users, roleRestriction: ['RECEPTIONIST'] },
    { label: 'Deleted Client List', href: '/dashboard/clients?filter=deleted', icon: Users },
    { label: 'Announcements', href: '/dashboard/announcements', icon: FileText },
    { label: 'Software Settings', href: '/dashboard/settings', icon: Settings, roleRestriction: ['RECEPTIONIST', 'MANAGER'] },
  ];

  const isTabActive = (item: string) => {
    if (item === 'DASHBOARD' && pathname === '/dashboard') return true;
    if (item === 'INQUIRY' && pathname.startsWith('/dashboard/crm')) return true;
    if (item === 'CLIENTS' && pathname.startsWith('/dashboard/clients')) return true;
    if (item === 'BILLING' && pathname.startsWith('/dashboard/payments')) return true;
    if (item === 'PACKAGES' && pathname.startsWith('/dashboard/packages')) return true;
    if (item === 'ATTENDANCE' && pathname.startsWith('/dashboard/attendance')) return true;
    if (item === 'REPORTS' && pathname.startsWith('/dashboard/reports')) return true;
    if (item === 'MANAGE' && (pathname.startsWith('/dashboard/schedules') || pathname.startsWith('/dashboard/expenses') || pathname.startsWith('/dashboard/staff') || pathname.startsWith('/dashboard/settings') || pathname.startsWith('/dashboard/announcements'))) return true;
    if (item === 'FORMS' && pathname.startsWith('/dashboard/assessments')) return true;
    return false;
  };

  return (
    <header ref={navRef} className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm select-none">
      <div className="w-full px-4 flex items-center justify-between h-14">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3 mr-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 font-black shadow-inner group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base group-hover:text-emerald-600 transition-colors">
                AUREX
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-semibold uppercase tracking-wider">
                Clinical CMS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none flex-1 max-w-5xl">
          {/* DASHBOARD */}
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('DASHBOARD')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Dashboard
          </Link>

          {/* INQUIRY */}
          <Link
            href="/dashboard/crm"
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('INQUIRY')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Inquiry
          </Link>

          {/* CLIENTS */}
          <Link
            href="/dashboard/clients"
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('CLIENTS')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Clients
          </Link>

          {/* BILLING & PAYMENTS */}
          <Link
            href="/dashboard/payments"
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('BILLING')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Billing & Payments
          </Link>

          {/* PACKAGES */}
          <Link
            href="/dashboard/packages"
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('PACKAGES')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Packages
          </Link>

          {/* WEEKDAY SESSIONS & SCHEDULE */}
          <Link
            href="/dashboard/bookings"
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              pathname.startsWith('/dashboard/bookings') || pathname.startsWith('/dashboard/schedules')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Sessions & Schedule
          </Link>

          {/* ATTENDANCE */}
          <Link
            href="/dashboard/attendance"
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('ATTENDANCE')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Attendance
          </Link>

          {/* CLINICAL FORMS */}
          <Link
            href="/dashboard/assessments"
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('FORMS')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Clinical Forms
          </Link>

          {/* REPORTS (Owner only) */}
          {role === 'OWNER' && (
            <Link
              href="/dashboard/reports"
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
                isTabActive('REPORTS')
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Reports
            </Link>
          )}
        </nav>


        {/* Right: User Profile & Status */}
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-800">
              Welcome, {session?.user?.name || 'Admin'}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
              {role}
            </span>
          </div>

          {/* User Avatar Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 hover:border-emerald-500 bg-slate-50 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {(session?.user?.name || 'A')[0].toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3.5 py-2 border-b border-slate-100 mb-1">
                  <div className="font-bold text-xs text-slate-900">{session?.user?.name || 'AUREX Staff'}</div>
                  <div className="text-[11px] text-slate-500 truncate">{session?.user?.email || 'admin@aurex.com'}</div>
                  <div className="text-[10px] mt-1 font-bold text-emerald-600 uppercase tracking-wide">Role: {role}</div>
                </div>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  System Settings
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left mt-1 border-t border-slate-100"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
