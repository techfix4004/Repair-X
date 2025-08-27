import { create } from 'zustand';

type LoginType = 'CUSTOMER' | 'ORGANIZATION' | 'SAAS_ADMIN';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'DISPATCHER' | 'ADMIN' | 'SUPER_ADMIN' | 'SAAS_ADMIN' | 'ORGANIZATION_OWNER' | 'ORGANIZATION_MANAGER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  phone?: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  loginType: LoginType;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loginType: LoginType | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<User>) => void;
}

interface LoginCredentials {
  email?: string;
  emailOrPhone?: string;
  password: string;
  organizationSlug?: string;
  adminKey?: string;
  type: LoginType;
}

type AuthStore = AuthState & AuthActions;

// API configuration for different login types
const getApiEndpoint = (type: LoginType): string => {
  switch (type) {
    case 'SAAS_ADMIN':
      return '/admin-backend/saas-admin/login';
    case 'CUSTOMER':
      return '/api/v1/auth/customer/login';
    case 'ORGANIZATION':
      return '/api/v1/auth/organization/login';
    default:
      throw new Error('Invalid login type');
  }
};

async function apiLogin(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  const endpoint = getApiEndpoint(credentials.type);
  
  const body: any = {
    password: credentials.password,
  };

  // Add type-specific fields
  switch (credentials.type) {
    case 'CUSTOMER':
      body.emailOrPhone = credentials.emailOrPhone;
      if (credentials.organizationSlug) {
        body.organizationSlug = credentials.organizationSlug;
      }
      break;
    case 'ORGANIZATION':
      body.email = credentials.email;
      if (credentials.organizationSlug) {
        body.organizationSlug = credentials.organizationSlug;
      }
      break;
    case 'SAAS_ADMIN':
      body.email = credentials.email;
      body.adminKey = credentials.adminKey;
      break;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `${credentials.type} authentication failed`);
  }

  const data = await response.json();
  return data;
}

export const useAuth = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  loginType: typeof window !== 'undefined' ? localStorage.getItem('loginType') as LoginType : null,

  // Actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const { user, token } = await apiLogin(credentials);
      
      // Store auth data
      if (typeof window !== 'undefined') {
        const storagePrefix = credentials.type === 'SAAS_ADMIN' ? 'saas-admin-' : '';
        localStorage.setItem(`${storagePrefix}token`, token);
        localStorage.setItem(`${storagePrefix}user`, JSON.stringify(user));
        localStorage.setItem('loginType', credentials.type);
      }
      
      set({
        user: { ...user, loginType: credentials.type },
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginType: credentials.type,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    const { loginType } = get();
    
    if (typeof window !== 'undefined') {
      const storagePrefix = loginType === 'SAAS_ADMIN' ? 'saas-admin-' : '';
      localStorage.removeItem(`${storagePrefix}token`);
      localStorage.removeItem(`${storagePrefix}user`);
      localStorage.removeItem('loginType');
    }
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loginType: null,
      error: null,
    });
  },

  refreshToken: async () => {
    const { token, loginType } = get();
    if (!token || !loginType) return;

    try {
      const endpoint = loginType === 'SAAS_ADMIN' 
        ? '/admin-backend/saas-admin/refresh'
        : '/api/v1/auth/refresh';
        
      const storagePrefix = loginType === 'SAAS_ADMIN' ? 'saas-admin-' : '';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { user, token: newToken } = await response.json();
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}token`, newToken);
          localStorage.setItem(`${storagePrefix}user`, JSON.stringify(user));
        }
        
        set({
          user: { ...user, loginType },
          token: newToken,
          isAuthenticated: true,
        });
      } else {
        // Token invalid, logout user
        get().logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      set({ user: updatedUser });
      
      const { loginType } = get();
      const storagePrefix = loginType === 'SAAS_ADMIN' ? 'saas-admin-' : '';
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${storagePrefix}user`, JSON.stringify(updatedUser));
      }
    }
  },
}));

// Initialize auth state from localStorage on app start
if (typeof window !== 'undefined') {
  const loginType = localStorage.getItem('loginType') as LoginType;
  
  if (loginType) {
    const storagePrefix = loginType === 'SAAS_ADMIN' ? 'saas-admin-' : '';
    const token = localStorage.getItem(`${storagePrefix}token`);
    const userStr = localStorage.getItem(`${storagePrefix}user`);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        useAuth.setState({
          user: { ...user, loginType },
          token,
          isAuthenticated: true,
          loginType,
        });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem(`${storagePrefix}token`);
        localStorage.removeItem(`${storagePrefix}user`);
        localStorage.removeItem('loginType');
      }
    }
  }
}

// Role-based route protection utilities
export const hasRole = (user: User | null, allowedRoles: User['role'][]): boolean => {
  return user ? allowedRoles.includes(user.role) : false;
};

export const isCustomer = (user: User | null): boolean => {
  return hasRole(user, ['CUSTOMER']);
};

export const isTechnician = (user: User | null): boolean => {
  return hasRole(user, ['TECHNICIAN']);
};

export const isOrganizationMember = (user: User | null): boolean => {
  return hasRole(user, ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN', 'TECHNICIAN']);
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER']);
};

export const isSaasAdmin = (user: User | null): boolean => {
  return hasRole(user, ['SAAS_ADMIN']);
};

export const hasOrganizationAccess = (user: User | null): boolean => {
  return user ? (user.organizationId !== null || user.role === 'SAAS_ADMIN') : false;
};

export const getDefaultRoute = (user: User | null): string => {
  if (!user) return '/auth/customer/login';
  
  switch (user.loginType) {
    case 'CUSTOMER':
      return '/customer/dashboard';
    case 'ORGANIZATION':
      return '/admin/dashboard';
    case 'SAAS_ADMIN':
      return '/saas-admin/dashboard';
    default:
      return '/';
  }
};

// Organization-bound access validation
export const canAccessOrganization = (user: User | null, organizationId: string): boolean => {
  if (!user) return false;
  if (user.role === 'SAAS_ADMIN') return true; // SaaS admins can access all orgs
  return user.organizationId === organizationId;
};

// Export types for external use
export type { User, LoginType, LoginCredentials };