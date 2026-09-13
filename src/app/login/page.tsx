'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Activity, ShieldCheck, Lock, User, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  function handleQuickLogin(userEmail: string, userPass: string) {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
    setLoading(true);

    signIn('credentials', {
      email: userEmail,
      password: userPass,
      redirect: false,
    }).then((res) => {
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-glow-emerald border border-emerald-400/30 mb-4">
            <Activity className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            AUREX <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-normal">ADMIN CMS</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">
            Clinical Exercise & Medical Fitness Management
          </p>
        </div>

        {/* Login Card */}
        <div className="clinical-card p-6 md:p-8 shadow-2xl border border-[#26354D] bg-[#111827]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Staff Sign In</h2>
              <p className="text-xs text-slate-400">Internal Admin Portal — Strict RBAC Enforced</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@aurex.com"
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B1120] border border-[#26354D] rounded-lg px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-glow-emerald transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick 1-Click Role Login (Demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('owner@aurex.com', 'AurexOwner@2026')}
                className="px-2.5 py-2 rounded-lg bg-emerald-950/40 border border-emerald-700/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium transition text-center flex flex-col items-center justify-center gap-0.5"
              >
                <span className="font-bold">Owner</span>
                <span className="text-[10px] text-emerald-400/80">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@aurex.com', 'AurexManager@2026')}
                className="px-2.5 py-2 rounded-lg bg-blue-950/40 border border-blue-700/50 hover:bg-blue-900/60 text-blue-300 text-xs font-medium transition text-center flex flex-col items-center justify-center gap-0.5"
              >
                <span className="font-bold">Manager</span>
                <span className="text-[10px] text-blue-400/80">Ops + Reports</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('receptionist@aurex.com', 'AurexRecp@2026')}
                className="px-2.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-medium transition text-center flex flex-col items-center justify-center gap-0.5"
              >
                <span className="font-bold">Reception</span>
                <span className="text-[10px] text-slate-400">Front Desk</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Strict Internal System • IP Logging & Session Isolation Active</span>
        </div>
      </div>
    </div>
  );
}
