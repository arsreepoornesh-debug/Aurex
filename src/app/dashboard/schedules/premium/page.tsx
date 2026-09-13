'use client';

import React from 'react';
import BookingsPage from '@/app/dashboard/bookings/page';

export default function PremiumSchedulePage() {
  return (
    <div>
      <div className="bg-[#1e3a8a] text-white px-6 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">
            Premium 1:1 Schedule (1:1 Dedicated Specialist)
          </span>
          <span className="text-[11px] text-blue-200">Enforces Max 1 Capacity Rule</span>
        </div>
      </div>
      <BookingsPage />
    </div>
  );
}
