'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Activity, 
  Calendar, 
  PlusCircle, 
  Award, 
  CreditCard, 
  FileHeart, 
  Bell, 
  PhoneCall, 
  LogOut,
  User
} from 'lucide-react';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { label: 'Home', href: '/portal', icon: Activity, exact: true },
    { label: 'My Appointments', href: '/portal/appointments', icon: Calendar },
    { label: 'Book Session', href: '/portal/book', icon: PlusCircle },
    { label: 'My Membership', href: '/portal/membership', icon: Award },
    { label: 'Payments & Invoices', href: '/portal/payments', icon: CreditCard },
    { label: 'My Progress & Goals', href: '/portal/assessment', icon: FileHeart },
    { label: 'Notifications', href: '/portal/notifications', icon: Bell },
    { label: 'Contact AUREX', href: '/portal/contact', icon: PhoneCall },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Portal Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2.5">
            <img
              src="/Aurex%20logo%201.png"
              alt="AUREX Logo"
              className="w-8 h-8 object-contain rounded-xl shrink-0"
            />
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base">AUREX</span>
              <span className="text-[10px] text-emerald-600 font-bold block -mt-1 uppercase tracking-wider">
                Client Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block">{session?.user?.name || 'Puneesh'}</span>
              <span className="text-[10px] font-mono text-slate-500">AUR-2026-0001</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Page Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>© 2026 AUREX Clinical Exercise & Medical Fitness. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
