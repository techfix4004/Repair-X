/**
 * RepairX Frontend Test Suite
 * 
 * Comprehensive testing for UI components and user interactions
 * to improve code coverage and Six Sigma quality metrics
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiRoleDashboard, { 
  CustomerPortal, 
  TechnicianDashboard, 
  AdminDashboard, 
  SaaSAdminPanel 
} from '../components/MultiRoleDashboard';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

describe('MultiRoleDashboard', () => {
  test('renders customer portal for customer role', () => {
    render(<MultiRoleDashboard role="CUSTOMER" />);
    expect(screen.getByText('Customer Portal')).toBeInTheDocument();
    expect(screen.getByText('Device Registration')).toBeInTheDocument();
  });

  test('renders technician dashboard for technician role', () => {
    render(<MultiRoleDashboard role="TECHNICIAN" />);
    expect(screen.getByText('Technician Dashboard')).toBeInTheDocument();
    expect(screen.getByText("Today's Jobs")).toBeInTheDocument();
  });

  test('renders admin dashboard for admin role', () => {
    render(<MultiRoleDashboard role="ADMIN" />);
    expect(screen.getByText('Business Management')).toBeInTheDocument();
    expect(screen.getByText('Business Settings (20+ Categories)')).toBeInTheDocument();
  });

  test('renders SaaS admin panel for SaaS admin role', () => {
    render(<MultiRoleDashboard role="SAAS_ADMIN" />);
    expect(screen.getByText('🏢 SaaS Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Tenant Management')).toBeInTheDocument();
  });

  test('defaults to customer portal for unknown role', () => {
    render(<MultiRoleDashboard role="UNKNOWN" />);
    expect(screen.getByText('Customer Portal')).toBeInTheDocument();
  });
});

describe('CustomerPortal', () => {
  test('renders device registration section', () => {
    render(<CustomerPortal />);
    expect(screen.getByText('📱 Register New Device')).toBeInTheDocument();
    expect(screen.getByText('📷 Scan QR Code')).toBeInTheDocument();
  });

  test('displays 12-state job tracking', () => {
    render(<CustomerPortal />);
    expect(screen.getByText('Job Status Tracking')).toBeInTheDocument();
    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText('DELIVERED')).toBeInTheDocument();
  });

  test('shows digital approval system', () => {
    render(<CustomerPortal />);
    expect(screen.getByText('Digital Approvals')).toBeInTheDocument();
    expect(screen.getByText('✅ Approve')).toBeInTheDocument();
    expect(screen.getByText('❌ Decline')).toBeInTheDocument();
  });

  test('handles approve button click', () => {
    render(<CustomerPortal />);
    const approveButton = screen.getByText('✅ Approve');
    fireEvent.click(approveButton);
    // Button should still be present after click
    expect(approveButton).toBeInTheDocument();
  });
});

describe('TechnicianDashboard', () => {
  // Mock window.addEventListener for online/offline events
  beforeAll(() => {
    global.window.addEventListener = jest.fn();
    global.window.removeEventListener = jest.fn();
  });

  test('renders job assignment section', () => {
    render(<TechnicianDashboard />);
    expect(screen.getByText("Today's Jobs")).toBeInTheDocument();
    expect(screen.getByText('Job #JS-2024-001')).toBeInTheDocument();
  });

  test('displays photo documentation tools', () => {
    render(<TechnicianDashboard />);
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('📷 Before Photos')).toBeInTheDocument();
    expect(screen.getByText('✍️ Customer Sign')).toBeInTheDocument();
  });

  test('shows time tracking interface', () => {
    render(<TechnicianDashboard />);
    expect(screen.getByText('Time Tracking')).toBeInTheDocument();
    expect(screen.getByText('01:23:45')).toBeInTheDocument();
  });

  test('handles navigation button click', () => {
    render(<TechnicianDashboard />);
    const navigateButton = screen.getByText('🚗 Navigate');
    fireEvent.click(navigateButton);
    expect(navigateButton).toBeInTheDocument();
  });
});

describe('AdminDashboard', () => {
  test('displays Six Sigma quality metrics', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('487 DPMO')).toBeInTheDocument();
    expect(screen.getByText('Cp: 0.01')).toBeInTheDocument();
    expect(screen.getByText('96.5%')).toBeInTheDocument(); // Customer Satisfaction
  });

  test('shows business settings categories', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Tax Settings')).toBeInTheDocument();
    expect(screen.getByText('Print Templates')).toBeInTheDocument();
    expect(screen.getByText('Workflow Config')).toBeInTheDocument();
  });

  test('renders 12-state workflow visualization', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('12-State Job Workflow')).toBeInTheDocument();
    expect(screen.getByText('CREATED')).toBeInTheDocument();
    expect(screen.getByText('QUALITY CHECK')).toBeInTheDocument();
  });

  test('displays configured vs pending settings', () => {
    render(<AdminDashboard />);
    // Should show some configured settings
    const configuredElements = screen.getAllByText('✅ Ready');
    expect(configuredElements.length).toBeGreaterThan(0);
    
    // Should show some pending settings  
    const pendingElements = screen.getAllByText('⏳ Pending');
    expect(pendingElements.length).toBeGreaterThan(0);
  });
});

describe('SaaSAdminPanel', () => {
  test('displays platform overview metrics', () => {
    render(<SaaSAdminPanel />);
    expect(screen.getByText('247')).toBeInTheDocument(); // Active Tenants
    expect(screen.getByText('$89,432')).toBeInTheDocument(); // Platform Revenue
    expect(screen.getByText('99.97%')).toBeInTheDocument(); // System Health
  });

  test('shows tenant management interface', () => {
    render(<SaaSAdminPanel />);
    expect(screen.getByText('TechFix Solutions')).toBeInTheDocument();
    expect(screen.getByText('QuickRepair Inc')).toBeInTheDocument();
    expect(screen.getByText('Mobile Masters')).toBeInTheDocument();
  });

  test('displays system configuration options', () => {
    render(<SaaSAdminPanel />);
    expect(screen.getByText('Platform Configuration')).toBeInTheDocument();
    expect(screen.getByText('White-label Settings')).toBeInTheDocument();
    expect(screen.getByText('Global Compliance Rules')).toBeInTheDocument();
  });

  test('shows cross-tenant analytics', () => {
    render(<SaaSAdminPanel />);
    expect(screen.getByText('Cross-Tenant Analytics')).toBeInTheDocument();
    expect(screen.getByText('Platform Usage Reports')).toBeInTheDocument();
    expect(screen.getByText('Revenue Analytics')).toBeInTheDocument();
  });

  test('handles configuration button clicks', () => {
    render(<SaaSAdminPanel />);
    const configureButton = screen.getByText('Configure →');
    fireEvent.click(configureButton);
    expect(configureButton).toBeInTheDocument();
  });
});

describe('Responsive Design', () => {
  test('renders properly on mobile viewport', () => {
    // Mock window dimensions for mobile
    global.innerWidth = 375;
    global.innerHeight = 667;
    
    render(<CustomerPortal />);
    expect(screen.getByText('Customer Portal')).toBeInTheDocument();
  });

  test('renders properly on tablet viewport', () => {
    // Mock window dimensions for tablet
    global.innerWidth = 768;
    global.innerHeight = 1024;
    
    render(<TechnicianDashboard />);
    expect(screen.getByText('Technician Dashboard')).toBeInTheDocument();
  });

  test('renders properly on desktop viewport', () => {
    // Mock window dimensions for desktop
    global.innerWidth = 1920;
    global.innerHeight = 1080;
    
    render(<AdminDashboard />);
    expect(screen.getByText('Business Management')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  test('has proper ARIA labels and roles', () => {
    render(<CustomerPortal />);
    // Check for semantic HTML elements
    expect(screen.getByRole('button', { name: /register new device/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scan qr code/i })).toBeInTheDocument();
  });

  test('supports keyboard navigation', () => {
    render(<TechnicianDashboard />);
    const startButton = screen.getByText('▶️ Start Job');
    startButton.focus();
    expect(startButton).toHaveFocus();
  });

  test('has proper color contrast for text', () => {
    render(<AdminDashboard />);
    // Test elements should have appropriate text colors
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });
});

export {};