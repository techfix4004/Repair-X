'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'CUSTOMER' | 'TECHNICIAN' | 'DISPATCHER' | 'ADMIN' | 'SUPER_ADMIN'>;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo || '/auth/login');
      return;
    }

    // If specific roles are required but user doesn't have the right role
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user's actual role
      const defaultRoute = getDefaultRoute(user.role);
      router.push(defaultRoute);
      return;
    }
  }, [isAuthenticated, user, isLoading, router, allowedRoles, redirectTo, requireAuth]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if auth check failed
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

function getDefaultRoute(role: string): string {
  switch (role) {
    case 'CUSTOMER':
      return '/customer';
    case 'TECHNICIAN':
      return '/technician';
    case 'DISPATCHER':
    case 'ADMIN':
      return '/admin';
    case 'SUPER_ADMIN':
      return '/saas-admin';
    default:
      return '/';
  }
}

// Higher-order component for page-level protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific protection components for each role
export function CustomerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      {children}
    </ProtectedRoute>
  );
}

export function TechnicianRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['TECHNICIAN']}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER', 'SUPER_ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}

export function SaasAdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}