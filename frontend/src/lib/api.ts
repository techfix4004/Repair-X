import { useAuthStore } from './auth';

// API Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: unknown[];
}

const createErrorResponse = (message: string): ApiErrorResponse => ({
  success: false,
  message,
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const { token } = useAuthStore.getState();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiErrorClass(data.message || `HTTP ${response.status}`, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error;
      }

      console.error('API request failed:', error);
      throw new ApiErrorClass('Network error or server unavailable');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${query}`);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

class ApiErrorClass extends Error {
  public success = false;
  public details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
  }
}

export const api = new ApiClient();

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: unknown) =>
    api.post('/auth/register', data),

  refreshToken: () =>
    api.post('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),
};

// Business Settings API
export const businessSettingsApi = {
  getAll: (params?: { category?: string; tenantId?: string }) =>
    api.get('/business-settings', params),

  getByCategory: (category: string, tenantId?: string) =>
    api.get(`/business-settings/category/${category}`, { tenantId }),

  create: (data: unknown) =>
    api.post('/business-settings', data),

  update: (id: string, data: unknown) =>
    api.put(`/business-settings/${id}`, data),

  delete: (id: string) =>
    api.delete(`/business-settings/${id}`),

  bulkUpdate: (settings: Array<{ id: string; value: unknown }>) =>
    api.post('/business-settings/bulk-update', { settings }),
};

// SMS API
export const smsApi = {
  getAccounts: () => api.get('/sms/accounts'),

  createAccount: (data: unknown) => api.post('/sms/accounts', data),

  sendSms: (data: unknown) => api.post('/sms/send', data),

  getMessages: (params?: Record<string, any>) => api.get('/sms/messages', params),

  getStats: (period?: '24h' | '7d' | '30d') => api.get('/sms/stats', { period }),
};

// Expense API
export const expenseApi = {
  getCategories: (includeInactive?: boolean) =>
    api.get('/expenses/categories', { includeInactive }),

  createCategory: (data: unknown) =>
    api.post('/expenses/categories', data),

  getExpenses: (params?: Record<string, any>) =>
    api.get('/expenses', params),

  createExpense: (data: unknown) =>
    api.post('/expenses', data),

  approveExpense: (id: string, data: unknown) =>
    api.post(`/expenses/${id}/approve`, data),

  getStats: (period?: '7d' | '30d' | '90d' | 'ytd', categoryId?: string) =>
    api.get('/expenses/stats', { period, categoryId }),
};

// Quotation API
export const quotationApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/quotations', params),

  getById: (id: string) =>
    api.get(`/quotations/${id}`),

  create: (data: unknown) =>
    api.post('/quotations', data),

  processApproval: (id: string, data: unknown) =>
    api.post(`/quotations/${id}/approve`, data),

  customerResponse: (id: string, data: unknown) =>
    api.post(`/quotations/${id}/customer-response`, data),

  convertToJob: (id: string) =>
    api.post(`/quotations/${id}/convert-to-job`),
};

// JobSheet API
export const jobSheetApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/jobsheets', params),

  getById: (id: string) =>
    api.get(`/jobsheets/${id}`),

  create: (data: unknown) =>
    api.post('/jobsheets', data),

  update: (id: string, data: unknown) =>
    api.put(`/jobsheets/${id}`, data),

  addPart: (id: string, data: unknown) =>
    api.post(`/jobsheets/${id}/parts`, data),

  removePart: (jobSheetId: string, partId: string) =>
    api.delete(`/jobsheets/${jobSheetId}/parts/${partId}`),

  generatePdf: (id: string) =>
    api.get(`/jobsheets/${id}/pdf`),

  getStats: () =>
    api.get('/jobsheets/stats/dashboard'),
};

// Device API
export const deviceApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/devices', params),

  getById: (id: string) =>
    api.get(`/devices/${id}`),

  create: (data: unknown) =>
    api.post('/devices', data),

  update: (id: string, data: unknown) =>
    api.put(`/devices/${id}`, data),

  delete: (id: string) =>
    api.delete(`/devices/${id}`),
};

// Booking API
export const bookingApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/bookings', params),

  getById: (id: string) =>
    api.get(`/bookings/${id}`),

  create: (data: unknown) =>
    api.post('/bookings', data),

  update: (id: string, data: unknown) =>
    api.put(`/bookings/${id}`, data),

  cancel: (id: string, reason?: string) =>
    api.post(`/bookings/${id}/cancel`, { reason }),
};

// User API
export const userApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/users', params),

  getById: (id: string) =>
    api.get(`/users/${id}`),

  update: (id: string, data: unknown) =>
    api.put(`/users/${id}`, data),

  updateProfile: (data: unknown) =>
    api.put('/users/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/users/change-password', data),
};

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiErrorClass) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Response type utilities
export type ApiResponseType<T> = ApiResponse<T>;
export { ApiErrorClass as ApiError };

export default api;
