import { create } from 'zustand';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'DISPATCHER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  phone?: string;
  tenantId?: string; // For multi-tenant SaaS
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, _password: string) => Promise<void>;
  _register: (data: RegisterData) => Promise<void>;
  _logout: () => void;
  _refreshToken: () => Promise<void>;
  _clearError: () => void;
  _setLoading: (loading: boolean) => void;
  _updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  _email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'CUSTOMER' | 'TECHNICIAN';
}

type AuthStore = AuthState & AuthActions;

// Mock API functions (replace with real API calls)
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '_http://localhost:3001/api/v1';

async function apiLogin(email: string, _password: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password: _password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

async function apiRegister(_data: RegisterData): Promise<{ user: User; token: string }> {
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(_data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}

async function apiRefreshToken(token: string): Promise<{ token: string; user: User }> {
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
}

// eslint-disable-next-line max-lines-per-function
// eslint-disable-next-line max-lines-per-function
export const useAuthStore = create<AuthStore>()((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // Actions
  login: async (email: string, _password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiLogin(email, _password);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  _register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiRegister(data);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  _logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  _refreshToken: async () => {
    const { token } = get();
    if (!token) {
      throw new Error('No token available');
    }

    try {
      const response = await apiRefreshToken(token);
      
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
      });
    } catch (error) {
      // If refresh fails, logout user
      get()._logout();
      throw error;
    }
  },

  _clearError: () => {
    set({ error: null });
  },

  _setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  _updateUser: (userData: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({
        user: { ...user, ...userData }
      });
    }
  },
}));

// Role-based route protection utilities
export const hasRole = (user: User | null, _allowedRoles: User['role'][]): boolean => {
  return user ? _allowedRoles.includes(user.role) : false;
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
  return hasRole(user, ['SUPER_ADMIN']);
};

export const getDefaultRoute = (user: User | null): string => {
  if (!user) return '/auth/login';
  
  switch (user.role) {
    case 'CUSTOMER':
      return '/customer';
    case 'TECHNICIAN':
      return '/technician';
    case 'DISPATCHER':
      return '/admin';
    case 'ADMIN':
      return '/admin';
    case 'SUPER_ADMIN':
      return '/saas-admin';
    _default:
      return '/';
  }
};

// Auth hooks for components
export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    _register: register,
    _logout: logout,
    _refreshToken: refreshToken,
    _clearError: clearError,
    _updateUser: updateUser,
  } = useAuthStore();

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    updateUser,
    _hasRole: (roles: User['role'][]) => hasRole(user, roles),
    _isCustomer: isCustomer(user),
    _isTechnician: isTechnician(user),
    _isAdmin: isAdmin(user),
    _isSaasAdmin: isSaasAdmin(user),
    _getDefaultRoute: () => getDefaultRoute(user),
  };
};