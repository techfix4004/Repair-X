import { create } from 'zustand';

type LoginType = 'USER_CLIENT' | 'ORGANIZATION' | 'SAAS_ADMIN';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'DISPATCHER' | 'ADMIN' | 'SUPER_ADMIN' | 'SAAS_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  phone?: string;
  tenantId?: string; // For multi-tenant SaaS
  organizationName?: string;
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
  login: (email: string, password: string, loginType: LoginType) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email?: string;
  emailOrPhone?: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  organizationName?: string;
  contactPerson?: string;
  tenantDomain?: string;
  adminKey?: string;
  loginType: LoginType;
  role?: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN' | 'SAAS_ADMIN';
}

type AuthStore = AuthState & AuthActions;

// API configuration for different login types
const getApiBaseUrl = (loginType: LoginType): string => {
  switch (loginType) {
    case 'SAAS_ADMIN':
      return process.env.NEXT_PUBLIC_SAAS_ADMIN_API_URL || 'http://localhost:3002/api/v1';
    case 'ORGANIZATION':
    case 'USER_CLIENT':
    default:
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }
};

async function apiLogin(email: string, password: string, loginType: LoginType): Promise<{ user: User; token: string }> {
  const apiBaseUrl = getApiBaseUrl(loginType);
  
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      email, 
      password, 
      loginType,
      // Add specific fields based on login type
      ...(loginType === 'USER_CLIENT' && { allowEmailOrPhone: true }),
      ...(loginType === 'ORGANIZATION' && { requireOrganization: true }),
      ...(loginType === 'SAAS_ADMIN' && { requireAdminAccess: true }),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `${loginType} authentication failed`);
  }

  const data = await response.json();
  return data;
}

async function apiRegister(registerData: RegisterData): Promise<{ user: User; token: string }> {
  const apiBaseUrl = getApiBaseUrl(registerData.loginType);
  
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registerData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
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
  login: async (email: string, password: string, loginType: LoginType) => {
    set({ isLoading: true, error: null });
    
    try {
      const { user, token } = await apiLogin(email, password, loginType);
      
      // Store auth data
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('loginType', loginType);
      }
      
      set({
        user: { ...user, loginType },
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginType,
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

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    
    try {
      const { user, token } = await apiRegister(data);
      
      // Store auth data
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('loginType', data.loginType);
      }
      
      set({
        user: { ...user, loginType: data.loginType },
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginType: data.loginType,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
      const apiBaseUrl = getApiBaseUrl(loginType);
      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { user, token: newToken } = await response.json();
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(user));
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
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  },
}));

// Initialize auth state from localStorage on app start
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const loginType = localStorage.getItem('loginType') as LoginType;
  
  if (token && userStr && loginType) {
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginType');
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

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, ['ADMIN', 'SUPER_ADMIN']);
};

export const isSaasAdmin = (user: User | null): boolean => {
  return hasRole(user, ['SAAS_ADMIN']);
};

export const getDefaultRoute = (user: User | null): string => {
  if (!user) return '/auth/login';
  
  switch (user.loginType) {
    case 'USER_CLIENT':
      return '/customer/dashboard';
    case 'ORGANIZATION':
      return '/admin/dashboard';
    case 'SAAS_ADMIN':
      return '/saas-admin/dashboard';
    default:
      return '/';
  }
};

// Export types for external use
export type { User, LoginType, RegisterData };