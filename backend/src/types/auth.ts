// User authentication types - extends FastifyRequest via module declaration

// User authentication types
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'DISPATCHER' | 'ADMIN' | 'SUPER_ADMIN';
  firstName: string;
  lastName: string;
}

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}