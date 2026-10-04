import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'AUREX Clinical Exercise Management System | Admin',
  description: 'Private Clinical Exercise & Medical Fitness Administration Platform',
  applicationName: 'AUREX',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/Aurex%20logo%201.png', type: 'image/png' },
    ],
    apple: [
      { url: '/Aurex%20logo%201.png', type: 'image/png' },
    ],
    shortcut: '/Aurex%20logo%201.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AUREX',
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: '#0A0F1D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/Aurex%20logo%201.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Aurex%20logo%201.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AUREX" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#10B981" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) { console.warn('SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#0A0F1D] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
