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

async function apiLogin(email: string, _password: string): Promise<{ _user: User; token: string }> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    _method: 'POST',
    _headers: {
      'Content-Type': 'application/json',
    },
    _body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

async function apiRegister(_data: RegisterData): Promise<{ _user: User; token: string }> {
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    _method: 'POST',
    _headers: {
      'Content-Type': 'application/json',
    },
    _body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}

async function apiRefreshToken(_token: string): Promise<{ _token: string; user: User }> {
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    _method: 'POST',
    _headers: {
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
  _user: null,
  _token: null,
  _isLoading: false,
  _error: null,
  _isAuthenticated: false,

  // Actions
  _login: async (email: string, _password: string) => {
    set({ _isLoading: true, _error: null });
    
    try {
      const response = await apiLogin(email, password);
      
      set({
        _user: response.user,
        _token: response.token,
        _isAuthenticated: true,
        _isLoading: false,
        _error: null,
      });
    } catch (error) {
      set({
        _error: error instanceof Error ? error.message : 'Login failed',
        _isLoading: false,
        _isAuthenticated: false,
      });
      throw error;
    }
  },

  _register: async (data: RegisterData) => {
    set({ _isLoading: true, _error: null });
    
    try {
      const response = await apiRegister(data);
      
      set({
        _user: response.user,
        _token: response.token,
        _isAuthenticated: true,
        _isLoading: false,
        _error: null,
      });
    } catch (error) {
      set({
        _error: error instanceof Error ? error.message : 'Registration failed',
        _isLoading: false,
        _isAuthenticated: false,
      });
      throw error;
    }
  },

  _logout: () => {
    set({
      _user: null,
      _token: null,
      _isAuthenticated: false,
      _error: null,
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
        _token: response.token,
        _user: response.user,
        _isAuthenticated: true,
      });
    } catch (error) {
      // If refresh fails, logout user
      get().logout();
      throw error;
    }
  },

  _clearError: () => {
    set({ _error: null });
  },

  _setLoading: (loading: boolean) => {
    set({ _isLoading: loading });
  },

  _updateUser: (userData: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({
        _user: { ...user, ...userData }
      });
    }
  },
}));

// Role-based route protection utilities
export const hasRole = (_user: User | null, _allowedRoles: User['role'][]): boolean => {
  return user ? allowedRoles.includes(user.role) : false;
};

export const isCustomer = (_user: User | null): boolean => {
  return hasRole(user, ['CUSTOMER']);
};

export const isTechnician = (_user: User | null): boolean => {
  return hasRole(user, ['TECHNICIAN']);
};

export const isAdmin = (_user: User | null): boolean => {
  return hasRole(user, ['ADMIN', 'SUPER_ADMIN']);
};

export const isSaasAdmin = (_user: User | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN']);
};

export const getDefaultRoute = (_user: User | null): string => {
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
    register,
    logout,
    refreshToken,
    clearError,
    updateUser,
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