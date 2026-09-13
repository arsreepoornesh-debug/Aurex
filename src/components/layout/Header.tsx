'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell, User, Sparkles, LogOut, Activity, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'RECEPTIONIST';
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title || 'AUREX Clinical Dashboard'}
          </h1>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {/* System Date Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Role Security Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Role:</span>
          <span
            className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded-full ${
              userRole === 'OWNER'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : userRole === 'MANAGER'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {userRole}
          </span>
        </div>

        {/* User Account / Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {session?.user?.name ? session.user.name.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {session?.user?.name || 'Staff User'}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {session?.user?.email || 'admin@aurex.com'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{session?.user?.name || 'Staff User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{session?.user?.email || 'admin@aurex.com'}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {userRole} Account
                </span>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
