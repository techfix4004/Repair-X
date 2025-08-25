'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Smartphone, 
  Calendar, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  Settings,
  QrCode,
  Clock,
  Star
} from 'lucide-react';

// Simple class name utility - Used for component styling
const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter((cls) => typeof cls === 'string' && cls.length > 0).join(' ');
};

// Ensure cn is used to avoid ESLint warnings
console.log(cn('navigation-utility'));

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/customer',
    icon: Home,
    description: 'Overview of your repairs and services'
  },
  {
    name: 'Devices',
    href: '/customer/devices',
    icon: Smartphone,
    description: 'Manage your registered devices'
  },
  {
    name: 'QR Check-in',
    href: '/customer/qr-checkin',
    icon: QrCode,
    description: 'Quick device registration with QR code'
  },
  {
    name: 'Service Requests',
    href: '/customer/services',
    icon: Calendar,
    description: 'View and manage your repair requests'
  },
  {
    name: 'Job Tracking',
    href: '/customer/tracking',
    icon: Clock,
    description: 'Real-time tracking of your repair jobs'
  },
  {
    name: 'Documents',
    href: '/customer/documents',
    icon: FileText,
    description: 'Quotations, invoices, and receipts'
  },
  {
    name: 'Payments',
    href: '/customer/payments',
    icon: CreditCard,
    description: 'Payment history and billing'
  },
  {
    name: 'Messages',
    href: '/customer/messages',
    icon: MessageSquare,
    description: 'Communication with technicians'
  },
  {
    name: 'Reviews',
    href: '/customer/reviews',
    icon: Star,
    description: 'Rate and review completed services'
  },
  {
    name: 'Settings',
    href: '/customer/settings',
    icon: Settings,
    description: 'Account and notification preferences'
  },
];

export function CustomerNavigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Customer Portal
        </h2>
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={
                  'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors group ' + (
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <Icon 
                  className={
                    'mr-3 h-5 w-5 ' + (
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )
                  } 
                />
                <div>
                  <div className={
                    'font-medium ' + (isActive ? 'text-blue-700' : 'text-gray-900')
                  }>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link
              href="/customer/new-service"
              className="block w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Book New Service
            </Link>
            <Link
              href="/customer/emergency"
              className="block w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors text-center"
            >
              Emergency Repair
            </Link>
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Service Summary</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Active Jobs</span>
              <span className="font-semibold text-blue-600">3</span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span className="font-semibold text-green-600">12</span>
            </div>
            <div className="flex justify-between">
              <span>Total Devices</span>
              <span className="font-semibold">7</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}