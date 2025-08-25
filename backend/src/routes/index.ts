import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth';
import { userRoutes, serviceRoutes, bookingRoutes, qualityRoutes } from './users';
import { paymentRoutes } from './payments';
import { deviceRoutes } from './devices';
import { jobSheetRoutes } from './jobsheets';
import { businessSettingsRoutes } from './business-settings';
import { enhancedBusinessSettingsRoutes } from './enhanced-business-settings';
import { jobSheetLifecycleRoutes } from './job-lifecycle';
import { smsRoutes } from './sms';
import { expenseRoutes } from './expenses';
import { quotationRoutes } from './quotations';
import { ratingRoutes } from './ratings';
import { chatRoutes } from './chat';
import { geolocationRoutes } from './geolocation';
import { businessIntelligenceRoutes } from './business-intelligence';
import { smartSchedulingRoutes } from './smart-scheduling';
import { systemHealthRoutes } from './system-health';
import { complianceRoutes } from './compliance';
import completeBusinessManagementRoutes from './complete-business-management';
import customerOnboardingRoutes from './customer-onboarding';
import marketingAutomationRoutes from './marketing-automation';
import launchCampaignsRoutes from './launch-campaigns';
import appStoreOptimizationRoutes from './app-store-optimization-fastify';
import customerSuccessRoutes from './customer-success-fastify';
import emailSettingsRoutes from './email-settings';
import employeeManagementRoutes from './employee-management';
import partsInventoryRoutes from './parts-inventory';
import multiLanguageRoutes from './multi-language';
import iotIntegrationRoutes from './iot-integration';
import enterprisePortalRoutes from './enterprise-portal';
import { advancedReportingRoutes } from './advanced-reporting';
import { franchiseManagementRoutes } from './franchise-management';
import outsourcingMarketplaceRoutes from './outsourcing-marketplace';
import termsConditionsRoutes from './terms-conditions';
import apiMarketplaceRoutes from './api-marketplace';
import visualRegressionTestingRoutes from './visual-regression-testing';
import mobileFieldOperationsRoutes from './mobile-field-operations';

 
// eslint-disable-next-line max-lines-per-function
export async function registerRoutes(_server: FastifyInstance): Promise<void> {
  // API versioning
  await server.register(async function (server) {
    // Authentication routes
    await server.register(authRoutes, { _prefix: '/auth' });
    
    // User management routes
    await server.register(userRoutes, { _prefix: '/users' });
    
    // Service management routes
    await server.register(serviceRoutes, { _prefix: '/services' });
    
    // Device management routes
    await server.register(deviceRoutes, { _prefix: '/devices' });
    
    // Booking management routes
    await server.register(bookingRoutes, { _prefix: '/bookings' });
    
    // Job sheet management routes
    await server.register(jobSheetRoutes, { _prefix: '/jobsheets' });
    
    // Payment processing routes
    await server.register(paymentRoutes, { _prefix: '/payments' });
    
    // Quality metrics routes
    await server.register(qualityRoutes, { _prefix: '/quality' });

    // Business Settings Management routes (20+ categories)
    await server.register(businessSettingsRoutes, { _prefix: '/business-settings' });

    // Enhanced Business Settings (Advanced 20+ category system)
    await server.register(enhancedBusinessSettingsRoutes, { _prefix: '/enhanced-business-settings' });

    // ✅ _NEW: Complete Business Management System (20+ Categories)
    await server.register(completeBusinessManagementRoutes, { _prefix: '/business-management' });

    // ✅ _NEW: Customer Onboarding Automation System
    await server.register(customerOnboardingRoutes);

    // ✅ _NEW: Marketing Automation System
    await server.register(marketingAutomationRoutes);

    // ✅ _NEW: Launch Campaign Execution System
    await server.register(launchCampaignsRoutes);

    // ✅ _NEW: App Store Optimization System
    await server.register(appStoreOptimizationRoutes);

    // ✅ _NEW: Customer Success Automation System
    await server.register(customerSuccessRoutes);

    // ✅ _NEW: Email Settings Management System (Category 4)
    await server.register(emailSettingsRoutes, { _prefix: '/email-settings' });

    // ✅ _NEW: Employee Management System (Category 6)
    await server.register(employeeManagementRoutes, { _prefix: '/employees' });

    // ✅ _NEW: Parts Inventory Management System (Category 16)
    await server.register(partsInventoryRoutes, { _prefix: '/inventory' });

    // ✅ _NEW: Multi-language Support System (Global Deployment)
    await server.register(multiLanguageRoutes, { _prefix: '/i18n' });

    // ✅ _NEW: IoT Device Integration System (Smart Device Connectivity)
    await server.register(iotIntegrationRoutes, { _prefix: '/iot' });

    // ✅ _NEW: Enterprise Customer Portal System (Large Account Management)
    await server.register(enterprisePortalRoutes, { _prefix: '/enterprise' });

    // ✅ _NEW: Advanced Reporting & Analytics System (Executive Dashboards)
    await server.register(advancedReportingRoutes);

    // ✅ _NEW: Franchise Management System (Multi-location Business Control)
    await server.register(franchiseManagementRoutes);

    // ✅ _NEW: Outsourcing Marketplace System (External Service Provider Network)
    await server.register(outsourcingMarketplaceRoutes, { _prefix: '/outsourcing' });

    // ✅ _NEW: Terms & Conditions Management System (Dynamic Legal Documents)
    await server.register(termsConditionsRoutes, { _prefix: '/terms' });

    // ✅ _NEW: API Marketplace System (Third-party Integrations & White-label Framework)
    await server.register(apiMarketplaceRoutes, { _prefix: '/api-marketplace' });

    // ✅ _NEW: Visual Regression Testing System (Automated UI Testing)
    await server.register(visualRegressionTestingRoutes, { _prefix: '/visual-testing' });

    // ✅ _NEW: Mobile Field Operations System (Enhanced Field Service Management)
    await server.register(mobileFieldOperationsRoutes, { _prefix: '/field-operations' });

    // Job Sheet Lifecycle Management (12-state workflow)
    await server.register(jobSheetLifecycleRoutes, { _prefix: '/job-lifecycle' });

    // SMS Management System routes
    await server.register(smsRoutes, { _prefix: '/sms' });

    // Expense Management routes
    await server.register(expenseRoutes, { _prefix: '/expenses' });

    // Quotation System routes (Multi-approval workflow)
    await server.register(quotationRoutes, { _prefix: '/quotations' });

    // Rating and Review System routes
    await server.register(ratingRoutes, { _prefix: '/ratings' });

    // Real-time Chat System routes
    await server.register(chatRoutes, { _prefix: '/chat' });

    // Geolocation Services routes 
    await server.register(geolocationRoutes, { _prefix: '/geolocation' });

    // AI-Powered Business Intelligence & Analytics routes
    await server.register(businessIntelligenceRoutes, { _prefix: '/ai-analytics' });

    // Smart Scheduling & Route Optimization routes
    await server.register(smartSchedulingRoutes, { _prefix: '/smart-scheduling' });

    // System Health & Monitoring routes
    await server.register(systemHealthRoutes);

    // Compliance & Audit routes
    await server.register(complianceRoutes, { _prefix: '/compliance' });
    
    console.log('✅ All RepairX API routes registered successfully');
    console.log('🎯 Complete Business Management System (20+ categories) now available at /api/v1/business-management');
    console.log('📧 Email Settings Management available at /api/v1/email-settings');
    console.log('👥 Employee Management System available at /api/v1/employees');  
    console.log('📦 Parts Inventory Management available at /api/v1/inventory');
    console.log('🌍 Multi-language Support available at /api/v1/i18n');
    console.log('🏭 IoT Device Integration available at /api/v1/iot');
    console.log('🏢 Enterprise Customer Portal available at /api/v1/enterprise');
    console.log('🤝 Outsourcing Marketplace System available at /api/v1/outsourcing');
    console.log('📜 Terms & Conditions Management available at /api/v1/terms');
    console.log('🔗 API Marketplace & White-label Framework available at /api/v1/api-marketplace');
    console.log('🎯 Visual Regression Testing System available at /api/v1/visual-testing');
    console.log('📱 Mobile Field Operations System available at /api/v1/field-operations');
  }, { _prefix: '/api/v1' });
}