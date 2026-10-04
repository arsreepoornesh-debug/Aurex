'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  ChevronDown, 
  Activity, 
  User, 
  LogOut, 
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
  Crown,
  ClipboardList,
  ShieldAlert,
  History,
  AlertCircle,
  Clock
} from 'lucide-react';

import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';

interface DropdownItem {
  label: string;
  href: string;
  icon?: any;
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
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

  // Dropdown menus
  const billingItems: DropdownItem[] = [
    { label: 'Billing & Due Payments', href: '/dashboard/payments', icon: AlertCircle },
    { label: 'Semi-Private Bills (₹12k)', href: '/dashboard/payments', icon: Layers },
    { label: 'Premium 1:1 Bills (₹12k)', href: '/dashboard/payments', icon: Sparkles },
    { label: 'Luxury Bills (₹46k)', href: '/dashboard/payments', icon: Crown },
    { label: 'Expenses Ledger', href: '/dashboard/expenses', icon: CreditCard },
  ];

  const packageItems: DropdownItem[] = [
    { label: 'All Packages & Roster', href: '/dashboard/packages', icon: Package },
    { label: 'Semi-Private (₹12,000)', href: '/dashboard/packages/semi-private', icon: Layers },
    { label: 'Premium 1:1 (₹12,000)', href: '/dashboard/packages/premium', icon: Sparkles },
    { label: 'Luxury Concierge (₹46,000)', href: '/dashboard/packages/luxury', icon: Crown },
  ];

  const reportItems: DropdownItem[] = [
    { label: 'All Reports & Analytics', href: '/dashboard/reports', icon: FileText },
    { label: 'Client Reports', href: '/dashboard/reports?tab=clients', icon: Users },
    { label: 'Attendance Reports', href: '/dashboard/reports?tab=attendance', icon: Calendar },
    { label: 'Revenue & Financials', href: '/dashboard/reports?tab=revenue', icon: DollarSign },
  ];

  const manageItems: DropdownItem[] = [
    { label: 'General Settings', href: '/dashboard/settings', icon: Settings },
    { label: 'Clinical Specialists', href: '/dashboard/specialists', icon: Users },
    { label: 'Staff & Roles', href: '/dashboard/staff', icon: Users },
    { label: 'Semi-Private Schedule', href: '/dashboard/schedules/semi-private', icon: Calendar },
    { label: 'Premium Schedule', href: '/dashboard/schedules/premium', icon: Sparkles },
  ];

  const isTabActive = (item: string) => {
    if (item === 'DASHBOARD' && pathname === '/dashboard') return true;
    if (item === 'INQUIRY' && pathname.startsWith('/dashboard/crm')) return true;
    if (item === 'CLIENTS' && pathname.startsWith('/dashboard/clients')) return true;
    if (item === 'BILLING' && (pathname.startsWith('/dashboard/payments') || pathname.startsWith('/dashboard/expenses'))) return true;
    if (item === 'PACKAGES' && pathname.startsWith('/dashboard/packages')) return true;
    if (item === 'ATTENDANCE' && pathname.startsWith('/dashboard/attendance')) return true;
    if (item === 'REPORTS' && pathname.startsWith('/dashboard/reports')) return true;
    if (item === 'MANAGE' && (pathname.startsWith('/dashboard/schedules') || pathname.startsWith('/dashboard/specialists') || pathname.startsWith('/dashboard/staff') || pathname.startsWith('/dashboard/settings'))) return true;
    if (item === 'FORMS' && pathname.startsWith('/dashboard/assessments')) return true;
    return false;
  };

  const isOwnerOrManager = role === 'OWNER' || role === 'MANAGER';

  return (
    <header ref={navRef} className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm select-none">
      <div className="w-full px-4 flex items-center justify-between h-14">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 mr-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <img
              src="/Aurex%20logo%201.png"
              alt="AUREX Logo"
              className="w-8 h-8 object-contain rounded-lg group-hover:scale-105 transition-transform"
            />
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

        {/* Center: Main Nav Links (All fully clickable and directly navigate) */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
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

          {/* INQUIRY / CRM */}
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

          {/* BILLING & PAYMENTS (Direct Link + Hover Dropdown) */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('BILLING')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className={`flex items-center rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('BILLING')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}>
              <Link
                href="/dashboard/payments"
                className="px-2.5 py-1.5 block"
              >
                Billing & Payments
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'BILLING' ? null : 'BILLING');
                }}
                className="pr-2 py-1.5 text-current hover:opacity-80"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeDropdown === 'BILLING' && (
              <div className="absolute left-0 mt-0.5 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                {billingItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors"
                  >
                    {item.icon && <item.icon className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* PACKAGES (Direct Link + Hover Dropdown) */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('PACKAGES')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className={`flex items-center rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('PACKAGES')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}>
              <Link
                href="/dashboard/packages"
                className="px-2.5 py-1.5 block"
              >
                Packages
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'PACKAGES' ? null : 'PACKAGES');
                }}
                className="pr-2 py-1.5 text-current hover:opacity-80"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeDropdown === 'PACKAGES' && (
              <div className="absolute left-0 mt-0.5 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                {packageItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 font-semibold transition-colors"
                  >
                    {item.icon && <item.icon className="w-4 h-4 text-purple-600 shrink-0" />}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

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

          {/* REPORTS */}
          {isOwnerOrManager && (
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('REPORTS')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className={`flex items-center rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
                isTabActive('REPORTS')
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}>
                <Link
                  href="/dashboard/reports"
                  className="px-2.5 py-1.5 block"
                >
                  Reports
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'REPORTS' ? null : 'REPORTS');
                  }}
                  className="pr-2 py-1.5 text-current hover:opacity-80"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeDropdown === 'REPORTS' && (
                <div className="absolute left-0 mt-0.5 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                  {reportItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                    >
                      {item.icon && <item.icon className="w-4 h-4 text-slate-400 shrink-0" />}
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MANAGE & SETTINGS */}
          {isOwnerOrManager && (
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('MANAGE')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className={`flex items-center rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
                isTabActive('MANAGE')
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}>
                <Link
                  href="/dashboard/settings"
                  className="px-2.5 py-1.5 block"
                >
                  Manage & Settings
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'MANAGE' ? null : 'MANAGE');
                  }}
                  className="pr-2 py-1.5 text-current hover:opacity-80"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeDropdown === 'MANAGE' && (
                <div className="absolute right-0 mt-0.5 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                  {manageItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                    >
                      {item.icon && <item.icon className="w-4 h-4 text-slate-400 shrink-0" />}
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FORMS */}
          <Link
            href="/dashboard/assessments"
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap uppercase tracking-wider ${
              isTabActive('FORMS')
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Forms
          </Link>
        </nav>

        {/* Right: User Profile & Role Indicator */}
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <PwaInstallPrompt />

          <div className="hidden lg:flex flex-col items-end">
            {role === 'OWNER' && (
              <span className="text-xs font-bold text-slate-800">
                {session?.user?.name || 'Prasan'}
              </span>
            )}
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
              {role}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 hover:border-emerald-500 bg-slate-50 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {role === 'OWNER' ? 'P' : role === 'MANAGER' ? 'M' : 'R'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3.5 py-2 border-b border-slate-100 mb-1">
                  {role === 'OWNER' ? (
                    <div className="font-bold text-xs text-slate-900">{session?.user?.name || 'Prasan'}</div>
                  ) : (
                    <div className="font-bold text-xs text-slate-900">{role === 'MANAGER' ? 'Manager Terminal' : 'Reception Terminal'}</div>
                  )}
                  <div className="text-[11px] text-slate-500 truncate">{session?.user?.email}</div>
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
