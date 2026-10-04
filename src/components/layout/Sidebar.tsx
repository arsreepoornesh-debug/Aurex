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
  CalendarCheck,
  ShieldCheck,
  Settings,
  Lock,
  Eye,
  EyeOff,
  X,
  Receipt
} from 'lucide-react';
import { canViewReports } from '@/lib/rbac';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';

  const [collapsed, setCollapsed] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});

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

  // Primary Clinical Navigation (Always visible and navigable)
  const primaryNavItems = [
    {
      name: 'AUREX Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'All Clients (360°)',
      href: '/dashboard/clients',
      icon: Users,
    },
    {
      name: 'Billing & Payments',
      href: '/dashboard/payments',
      icon: CreditCard,
      badge: counts.pendingPayments ? String(counts.pendingPayments) : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      name: 'Clinical Packages',
      href: '/dashboard/packages',
      icon: Package,
    },
    {
      name: 'Slot Booking',
      href: '/dashboard/slot-booking',
      icon: CalendarCheck,
    },
    {
      name: 'Today Schedule',
      href: '/dashboard/bookings',
      icon: CalendarDays,
    },
    {
      name: 'Attendance',
      href: '/dashboard/attendance',
      icon: ClipboardList,
    },
    {
      name: 'Clinical Assessments',
      href: '/dashboard/assessments',
      icon: FileHeart,
    },
  ];

  // Quick Manage Sub-items
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
    ...(userRole === 'RECEPTIONIST'
      ? [
          {
            id: 'expenses',
            name: 'Expenses',
            href: '/dashboard/expenses',
            icon: Receipt,
            badge: undefined,
            badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          },
        ]
      : []),
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
      name: 'Anniversaries',
      href: '/dashboard/anniversaries',
      icon: Award,
      badge: counts.anniversaries ? String(counts.anniversaries) : undefined,
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
  ];

  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const roleEmails: Record<string, string> = {
    OWNER: 'owner@aurex.com',
    MANAGER: 'manager@aurex.com',
    RECEPTIONIST: 'receptionist@aurex.com',
  };

  const defaultPasswords: Record<string, string> = {
    OWNER: 'AurexOwner@2026',
    MANAGER: 'AurexManager@2026',
    RECEPTIONIST: 'AurexRecp@2026',
  };

  function handleRoleClick(targetRole: string) {
    if (targetRole === userRole) return;

    // IF CURRENT USER IS OWNER: can switch to any role without password!
    if (userRole === 'OWNER') {
      const email = roleEmails[targetRole] || 'receptionist@aurex.com';
      const pass = defaultPasswords[targetRole] || 'AurexRecp@2026';
      signIn('credentials', {
        email,
        password: pass,
        redirect: false,
      }).then(() => {
        window.location.reload();
      });
      return;
    }

    // IF CURRENT USER IS MANAGER OR RECEPTIONIST: must enter target role's password!
    setPendingRole(targetRole);
    setPasswordInput('');
    setPasswordError('');
    setShowPassword(false);
  }

  async function handleConfirmSwitch(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingRole) return;
    if (!passwordInput.trim()) {
      setPasswordError('Please enter password');
      return;
    }

    setIsAuthenticating(true);
    setPasswordError('');

    const email = roleEmails[pendingRole] || 'receptionist@aurex.com';
    const res = await signIn('credentials', {
      email,
      password: passwordInput,
      redirect: false,
    });

    if (res?.error) {
      setIsAuthenticating(false);
      setPasswordError(`Invalid password for ${pendingRole}`);
      return;
    }

    window.location.reload();
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
      {/* Top Section */}
      <div className="flex flex-col min-h-0 flex-1 overflow-y-auto scrollbar-none">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <img
              src="/Aurex%20logo%201.png"
              alt="AUREX Logo"
              className="w-8 h-8 object-contain shrink-0 rounded-lg"
            />
            {!collapsed && (
              <div className="truncate">
                <div className="text-sm font-extrabold tracking-wider text-white">AUREX</div>
                <div className="text-[9px] font-semibold text-emerald-400 tracking-widest uppercase">
                  Clinical CMS
                </div>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation Links */}
        <div className="p-2 space-y-1">
          <nav className="space-y-0.5">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center rounded-lg text-xs transition-all duration-150 relative group ${
                    collapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'
                  } ${
                    isActive
                      ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
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

                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Operations Submenu */}
          <div className="pt-3 border-t border-slate-800/80 mt-2">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition"
              >
                <span>Quick Operations</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showQuickMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ) : (
              <div className="w-6 h-px bg-slate-800 mx-auto my-2" />
            )}

            {(!collapsed ? showQuickMenu : true) && (
              <nav className="space-y-0.5 mt-1">
                {quickManageItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center rounded-lg text-xs transition-all duration-150 relative group ${
                        collapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5'
                      } ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
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

      {/* Bottom: Active User & 3-Role Switcher */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/60">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  {userRole === 'OWNER' && (
                    <p className="text-xs font-bold text-white truncate">
                      {session?.user?.name || 'Prasan'}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 truncate">
                    {session?.user?.email || (userRole === 'OWNER' ? 'owner@aurex.com' : userRole === 'MANAGER' ? 'manager@aurex.com' : 'receptionist@aurex.com')}
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

              {/* Role Switcher (Owner, Manager, Receptionist) */}
              <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Switch:
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleRoleClick('OWNER')}
                    title={userRole === 'OWNER' ? 'Active: Owner' : 'Switch to Owner (Password Required)'}
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
                    onClick={() => handleRoleClick('MANAGER')}
                    title={userRole === 'OWNER' ? 'Switch to Manager without password' : 'Switch to Manager (Password Required)'}
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
                    onClick={() => handleRoleClick('RECEPTIONIST')}
                    title={userRole === 'OWNER' ? 'Switch to Receptionist without password' : 'Switch to Receptionist (Password Required)'}
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
              title={userRole === 'OWNER' ? `Prasan (${userRole})` : userRole}
            >
              {userRole === 'OWNER' ? 'P' : userRole === 'MANAGER' ? 'M' : 'R'}
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

      {/* Password Authentication Modal for Role Switching */}
      {pendingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#0B1120] border border-[#26354D] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-white">
            <button
              type="button"
              onClick={() => {
                setPendingRole(null);
                setPasswordInput('');
                setPasswordError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow-md">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Authenticate Role Switch</h3>
                <p className="text-[11px] text-slate-400">
                  Switching to <span className="font-semibold text-emerald-400">{pendingRole}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmSwitch} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Enter Password for {roleEmails[pendingRole]}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder={`Enter ${pendingRole.toLowerCase()} password`}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1.5 text-xs text-rose-400 font-medium flex items-center gap-1">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingRole(null);
                    setPasswordInput('');
                    setPasswordError('');
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating || !passwordInput}
                  className="flex-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  {isAuthenticating ? 'Authenticating...' : 'Confirm Switch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
