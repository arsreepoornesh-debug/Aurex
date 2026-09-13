import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <TopNav />
      <div className="flex flex-1 min-h-0 bg-[#F8FAFC]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FAFC]">
          <main className="flex-1 pb-16">{children}</main>
        </div>
      </div>
    </div>
  );
}
