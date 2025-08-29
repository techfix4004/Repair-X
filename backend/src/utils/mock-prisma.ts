/**
 * Mock Prisma Client for development without database connection
 * This allows the build to succeed while we work on the application
 */

// Mock user for testing
const mockUser = {
  id: 'user_123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'CUSTOMER',
  organizationId: 'org_123',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock booking for testing
const mockBooking = {
  id: 'booking_123',
  customerId: 'user_123',
  technicianId: 'tech_123',
  status: 'COMPLETED',
  description: 'Test booking',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock review for testing
const mockReview = {
  id: 'review_123',
  bookingId: 'booking_123',
  customerId: 'user_123',
  technicianId: 'tech_123',
  rating: 5,
  comment: 'Great service',
  createdAt: new Date(),
  updatedAt: new Date()
};

const createMockModel = (modelName: string, mockData: any) => ({
  findUnique: async ({ where, select, include }: any) => {
    console.log(`Mock ${modelName}.findUnique called with:`, { where, select, include });
    return mockData;
  },
  findFirst: async ({ where, select, include }: any) => {
    console.log(`Mock ${modelName}.findFirst called with:`, { where, select, include });
    return mockData;
  },
  findMany: async ({ where, select, include, orderBy, skip, take }: any) => {
    console.log(`Mock ${modelName}.findMany called with:`, { where, select, include, orderBy, skip, take });
    return [mockData];
  },
  create: async ({ data }: any) => {
    console.log(`Mock ${modelName}.create called with:`, { data });
    return { ...mockData, ...data, id: `${modelName.toLowerCase()}_${Date.now()}` };
  },
  update: async ({ where, data }: any) => {
    console.log(`Mock ${modelName}.update called with:`, { where, data });
    return { ...mockData, ...data };
  },
  delete: async ({ where }: any) => {
    console.log(`Mock ${modelName}.delete called with:`, { where });
    return mockData;
  },
  count: async ({ where }: any) => {
    console.log(`Mock ${modelName}.count called with:`, { where });
    return 1;
  },
  groupBy: async ({ by, where, _count }: any) => {
    console.log(`Mock ${modelName}.groupBy called with:`, { by, where, _count });
    return [{ rating: 5, _count: { rating: 1 } }];
  }
});

export class PrismaClient {
  // Main models
  user = createMockModel('User', mockUser);
  organization = createMockModel('Organization', { id: 'org_123', name: 'Test Org' });
  booking = createMockModel('Booking', mockBooking);
  review = createMockModel('Review', mockReview);
  
  // Other models from schema
  customerProfile = createMockModel('CustomerProfile', {});
  technicianProfile = createMockModel('TechnicianProfile', {});
  address = createMockModel('Address', {});
  serviceCategory = createMockModel('ServiceCategory', {});
  service = createMockModel('Service', {});
  device = createMockModel('Device', {});
  jobSheet = createMockModel('JobSheet', {});
  payment = createMockModel('Payment', {});
  message = createMockModel('Message', {});
  bookingAttachment = createMockModel('BookingAttachment', {});
  businessSettings = createMockModel('BusinessSettings', {});
  smsAccount = createMockModel('SmsAccount', {});
  smsMessage = createMockModel('SmsMessage', {});
  expenseCategory = createMockModel('ExpenseCategory', {});
  expense = createMockModel('Expense', {});
  quotation = createMockModel('Quotation', {});
  quotationItem = createMockModel('QuotationItem', {});
  serviceProvider = createMockModel('ServiceProvider', {});
  outsourcedJob = createMockModel('OutsourcedJob', {});
  documentTemplate = createMockModel('DocumentTemplate', {});
  generatedDocument = createMockModel('GeneratedDocument', {});
  
  // Enhanced models from schema
  appStoreOptimization = createMockModel('AppStoreOptimization', {});
  launchCampaign = createMockModel('LaunchCampaign', {});
  customerSuccessProfile = createMockModel('CustomerSuccessProfile', {});
  visualRegressionSuite = createMockModel('VisualRegressionSuite', {});
  printJob = createMockModel('PrintJob', {});

  // Connection methods
  async $connect() {
    console.log('Mock Prisma client connected');
  }

  async $disconnect() {
    console.log('Mock Prisma client disconnected');
  }

  async $queryRaw(query: any) {
    console.log('Mock Prisma $queryRaw called with:', query);
    return [{ result: 1 }];
  }

  async $executeRaw(query: any) {
    console.log('Mock Prisma $executeRaw called with:', query);
    return 1;
  }
}

export { PrismaClient as default };