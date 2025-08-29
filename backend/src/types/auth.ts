// User authentication types - extends FastifyRequest via module declaration

// Extended user authentication types for RepairX
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'DISPATCHER' | 'ADMIN' | 'SUPER_ADMIN' | 'SAAS_ADMIN' | 'ORG_OWNER' | 'MANAGER';
  firstName: string;
  lastName: string;
  organizationId?: string;
  permissions?: string[];
  authType?: 'SAAS_ADMIN' | 'ORGANIZATION_MEMBER' | 'CUSTOMER';
}

// Extend FastifyRequest to include additional auth properties
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    organizationId?: string;
    authType?: 'SAAS_ADMIN' | 'ORGANIZATION_MEMBER' | 'CUSTOMER';
  }
}