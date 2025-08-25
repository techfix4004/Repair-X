'use client';

import { ReactNode } from 'react';
import { CustomerRoute } from '@/components/auth/ProtectedRoute';
import { CustomerNavigation } from '@/components/customer/CustomerNavigation';
import { CustomerHeader } from '@/components/customer/CustomerHeader';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <CustomerRoute>
      <div className="min-h-screen bg-gray-50">
        <CustomerHeader />
        
        <div className="flex">
          <CustomerNavigation />
          
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </CustomerRoute>
  );
}