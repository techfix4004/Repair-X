'use client';

import { useAuth } from '@/lib/auth';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function CustomerHeader() {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">RepairX</div>
            <span className="ml-3 text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
              Customer Portal
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search devices, repairs, or services..."
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <a href="/customer/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile Settings
                    </a>
                    <a href="/customer/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Billing & Payment
                    </a>
                    <a href="/help" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Help & Support
                    </a>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}