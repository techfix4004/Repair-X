'use client';

/**
 * SaaS Admin Panel Page
 * 
 * This is the SEPARATE multi-tenant management interface as specified
 * in the copilot-instructions.md requirements. This panel is completely
 * separate from customer interfaces and is dedicated to:
 * 
 * - Multi-tenant subscription management
 * - Cross-tenant analytics and reporting
 * - Platform-wide configuration
 * - White-label settings management
 * - System-wide compliance monitoring
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SaaSAdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push('/saas-admin/dashboard');
  }, [router]);

  return null;
}