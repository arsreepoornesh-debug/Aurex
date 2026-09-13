'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut, signIn } from 'next-auth/react';
import {
  PhoneCall,
  Clock,
  Wallet,
  RefreshCw,
  AlertTriangle,
  Cake,
  Award,
  CalendarDays,
  LayoutDashboard,
  Activity,
  Users,
  ClipboardList,
  Package,
  Stethoscope,
  FileHeart,
  BarChart3,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
  User,
} from 'lucide-react';
import { canViewReports } from '@/lib/rbac';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';

  // Collapsible state
  const [collapsed, setCollapsed] = useState(false);
  const [showClinicalMenu, setShowClinicalMenu] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Fetch live counts for Quick Manage badges
  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await fetch('/api/quick-manage');
        if (res.ok) {
          const data = await res.json();
          setCounts(data.counts || {});
        }
      } catch (e) {
        // silent fallback
      }
    }
    loadCounts();
  }, [pathname]);

  // Exact 9 Quick Manage Items in order
  const quickManageItems = [
    {
      id: 'followups',
      name: 'Follow-ups',
      href: '/dashboard/follow-ups',
      icon: PhoneCall,
      badge: counts.followUps ? String(counts.followUps) : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'leads',
      name: 'Pending Leads',
      href: '/dashboard/crm',
      icon: Clock,
      badge: counts.pendingLeads ? String(counts.pendingLeads) : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'payments',
      name: 'Pending Payments',
      href: '/dashboard/payments',
      icon: Wallet,
      badge: counts.pendingPayments ? String(counts.pendingPayments) : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    {
      id: 'renewals',
      name: 'Upcoming Renewals',
      href: '/dashboard/renewals',
      icon: RefreshCw,
      badge: counts.renewals ? String(counts.renewals) : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'irregular',
      name: 'Irregular Clients',
      href: '/dashboard/irregular',
      icon: AlertTriangle,
      badge: counts.irregular ? String(counts.irregular) : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'birthdays',
      name: 'Client Birthdays',
      href: '/dashboard/birthdays',
      icon: Cake,
      badge: counts.birthdays ? String(counts.birthdays) : undefined,
      badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    },
    {
      id: 'anniversary',
      name: 'Membership Anniversary',
      href: '/dashboard/anniversaries',
      icon: Award,
      badge: counts.anniversaries ? String(counts.anniversaries) : undefined,
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    {
      id: 'schedule',
      name: "Today's Schedule",
      href: '/dashboard/bookings',
      icon: CalendarDays,
    },
    {
      id: 'dashboard',
      name: 'AUREX Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
  ];

  // Secondary Clinical & Records Items
  const clinicalNavItems = [
    {
      name: 'All Clients (360°)',
      href: '/dashboard/clients',
      icon: Users,
      allowed: true,
    },
    {
      name: 'Live Attendance',
      href: '/dashboard/attendance',
      icon: ClipboardList,
      allowed: true,
    },
    {
      name: 'Packages Catalog',
      href: '/dashboard/packages',
      icon: Package,
      allowed: true,
    },
    {
      name: 'Specialists Roster',
      href: '/dashboard/specialists',
      icon: Stethoscope,
      allowed: true,
    },
    {
      name: 'Clinical Assessments',
      href: '/dashboard/assessments',
      icon: FileHeart,
      allowed: true,
    },
    {
      name: 'Reports & Analytics',
      href: '/dashboard/reports',
      icon: BarChart3,
      allowed: canViewReports(userRole),
    },
  ];

  function handleRoleSwitch(targetRole: string) {
    let email = 'receptionist@aurex.com';
    let pass = 'AurexRecp@2026';
    if (targetRole === 'OWNER') {
      email = 'owner@aurex.com';
      pass = 'AurexOwner@2026';
    } else if (targetRole === 'MANAGER') {
      email = 'manager@aurex.com';
      pass = 'AurexManager@2026';
    }

    signIn('credentials', {
      email,
      password: pass,
      redirect: false,
    }).then(() => {
      window.location.reload();
    });
  }

  const roleColors: Record<string, string> = {
    OWNER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    MANAGER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    RECEPTIONIST: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <aside
      className={`bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen text-slate-300 transition-all duration-300 sticky top-0 h-screen z-40 ${
        collapsed ? 'w-[64px]' : 'w-[240px]'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col min-h-0 flex-1 overflow-y-auto scrollbar-none">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950 border border-emerald-400/30">
              <Activity className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-sm font-extrabold tracking-wider text-white">AUREX</div>
                <div className="text-[9px] font-semibold text-emerald-400 tracking-widest uppercase">
                  Clinical CMS
                </div>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
            title={collapsed ? 'Expand sidebar (240px)' : 'Collapse sidebar (64px)'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* TOP SECTION — QUICK MANAGE */}
        <div className="p-2 space-y-1">
          {!collapsed ? (
            <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Quick Manage</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          ) : (
            <div className="h-2" />
          )}

          <nav className="space-y-0.5">
            {quickManageItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center rounded-lg text-xs transition-all duration-150 relative group ${
                    collapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'
                  } ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full border font-bold shrink-0 ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                      {item.name}
                      {item.badge && <span className="ml-1.5 text-emerald-400">({item.badge})</span>}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Clinical Operations Section */}
          <div className="pt-3 border-t border-slate-800/80 mt-2">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setShowClinicalMenu(!showClinicalMenu)}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition"
              >
                <span>Clinical Records</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showClinicalMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ) : (
              <div className="w-6 h-px bg-slate-800 mx-auto my-2" />
            )}

            {(!collapsed ? showClinicalMenu : true) && (
              <nav className="space-y-0.5 mt-1">
                {clinicalNavItems
                  .filter((item) => item.allowed)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        title={collapsed ? item.name : undefined}
                        className={`flex items-center rounded-lg text-xs transition-all duration-150 relative group ${
                          collapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-1.5'
                        } ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          {!collapsed && <span className="truncate">{item.name}</span>}
                        </div>

                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                            {item.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Bottom of Sidebar: Logged-in User, Role Badge, Logout */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/40">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {session?.user?.name || 'Staff User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {session?.user?.email || 'admin@aurex.com'}
                  </p>
                </div>
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full border ${
                    roleColors[userRole] || roleColors.RECEPTIONIST
                  }`}
                >
                  {userRole}
                </span>
              </div>

              {/* Role Switcher */}
              <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Switch:
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('OWNER')}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                      userRole === 'OWNER'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('MANAGER')}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                      userRole === 'MANAGER'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Mgr
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('RECEPTIONIST')}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                      userRole === 'RECEPTIONIST'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Recp
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div
              className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-xs"
              title={`${session?.user?.name} (${userRole})`}
            >
              {session?.user?.name ? session.user.name.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
