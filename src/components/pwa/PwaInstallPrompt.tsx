'use client';

import React, { useEffect, useState } from 'react';
import { Download, Monitor, Laptop, CheckCircle2, X, Apple, Info } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // 1. Detect if already installed/running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 2. Platform detection (Mac vs Windows)
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      const platform = (window.navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform?.toLowerCase() || window.navigator.platform.toLowerCase();
      const macDetected = platform.includes('mac') || ua.includes('macintosh') || ua.includes('mac os');
      const safariDetected = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      setIsMac(macDetected);
      setIsSafari(safariDetected);
    }

    // 3. Capture beforeinstallprompt event (Chromium on Windows & macOS)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowModal(false);
        }
      } catch (err) {
        console.error('Error installing PWA:', err);
        setShowModal(true);
      }
    } else {
      // If browser doesn't support direct programmatic prompt (e.g. Safari on Mac or Firefox)
      setShowModal(true);
    }
  };

  // If already running standalone desktop app, show a discreet status indicator
  if (isStandalone) {
    return (
      <div
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] font-semibold"
        title="AUREX is running as an installed desktop app"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Desktop App</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition shadow-sm border border-emerald-500/30 group"
        title="Download / Install AUREX Desktop App (Windows & Mac)"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {/* Installation Guide & Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#0B1120] border border-[#26354D] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative text-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950 border border-emerald-400/30">
                <Laptop className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Install AUREX Desktop App</h3>
                <p className="text-xs text-slate-400">Run natively on Windows and Mac without browser tabs</p>
              </div>
            </div>

            {deferredPrompt && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-300">1-Click Install Available</div>
                  <div className="text-[11px] text-slate-300">Download and launch from your desktop or dock</div>
                </div>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow"
                >
                  Install Now
                </button>
              </div>
            )}

            <div className="space-y-3.5 text-xs text-slate-300">
              {/* Mac Instructions */}
              <div className={`p-3.5 rounded-xl border ${isMac ? 'bg-slate-900 border-emerald-500/40' : 'bg-slate-900/60 border-slate-800'}`}>
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <Apple className="w-4 h-4 text-emerald-400" />
                  <span>On Mac (macOS):</span>
                  {isMac && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">Your System</span>}
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300 pl-5 list-disc">
                  <li>
                    <strong className="text-white">Safari (macOS Sonoma 14+):</strong> Click{' '}
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono">File</span> in the Mac top menu $\rightarrow$ Click{' '}
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-semibold font-mono">Add to Dock</span>.
                  </li>
                  <li>
                    <strong className="text-white">Chrome / Edge on Mac:</strong> Click the{' '}
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-semibold">Install icon</span> in the top-right address bar, or click "Install Now" above.
                  </li>
                  <li>
                    AUREX will be added to your Mac <strong className="text-white">Applications</strong> and <strong className="text-white">Dock</strong> as a native standalone app!
                  </li>
                </ul>
              </div>

              {/* Windows Instructions */}
              <div className={`p-3.5 rounded-xl border ${!isMac ? 'bg-slate-900 border-emerald-500/40' : 'bg-slate-900/60 border-slate-800'}`}>
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <Monitor className="w-4 h-4 text-teal-400" />
                  <span>On Windows Desktop:</span>
                  {!isMac && <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 font-medium">Your System</span>}
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300 pl-5 list-disc">
                  <li>
                    <strong className="text-white">Chrome or Edge:</strong> Click the <strong className="text-emerald-400">Install icon</strong> in your browser's address bar (or click "Install Now").
                  </li>
                  <li>
                    Creates a desktop icon on your <strong className="text-white">Windows Desktop</strong> and <strong className="text-white">Start Menu</strong> with isolated secure window.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Offline Support & High-Speed Cache Active
              </span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
