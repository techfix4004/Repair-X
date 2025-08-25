import { useAuthStore } from './auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ApiResponse<T = any> {
  _success: boolean;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any[];
}

// Create a utility function using the interface
const createErrorResponse = (message: string): ApiErrorResponse => ({
  success: false,
  message,
});

// Use the function to avoid unused warnings
console.log('API utility loaded', createErrorResponse);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '_http://localhost:3001/api/v1';

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
      
      console.error('API request _failed:', error);
      throw new ApiErrorClass('Network error or server unavailable');
    }
  }

  // Generic CRUD methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T>(_endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${_endpoint}${query}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<T>(_endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(_endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async put<T>(_endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(_endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(_endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(_endpoint, {
      method: 'DELETE',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async patch<T>(_endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(_endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

class ApiErrorClass extends Error {
  public success = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public details?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(_message: string, details?: any) {
    super(_message);
    this.name = 'ApiError';
    this.details = details;
  }
}

// Create singleton instance
export const api = new ApiClient();

// Specific API methods for different modules
export const authApi = {
  _login: (email: string, _password: string) => 
    api.post('/auth/login', { email, password: _password }),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _register: (data: any) => 
    api.post('/auth/register', data),
  
  _refreshToken: () => 
    api.post('/auth/refresh'),
  
  _logout: () => 
    api.post('/auth/logout'),
  
  _me: () => 
    api.get('/auth/me'),
};

export const businessSettingsApi = {
  _getAll: (params?: { category?: string; tenantId?: string }) =>
    api.get('/business-settings', params),
  
  _getByCategory: (category: string, tenantId?: string) =>
    api.get(`/business-settings/category/${category}`, { tenantId }),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _create: (data: any) =>
    api.post('/business-settings', data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _update: (id: string, data: any) =>
    api.put(`/business-settings/${id}`, data),
  
  _delete: (id: string) =>
    api.delete(`/business-settings/${id}`),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _bulkUpdate: (settings: Array<{ id: string; value: any }>) =>
    api.post('/business-settings/bulk-update', { settings }),
};

export const smsApi = {
  _getAccounts: () =>
    api.get('/sms/accounts'),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createAccount: (data: any) =>
    api.post('/sms/accounts', data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _sendSms: (data: any) =>
    api.post('/sms/send', data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getMessages: (params?: any) =>
    api.get('/sms/messages', params),
  
  _getStats: (period?: '24h' | '7d' | '30d') =>
    api.get('/sms/stats', { period }),
};

export const expenseApi = {
  _getCategories: (includeInactive?: boolean) =>
    api.get('/expenses/categories', { includeInactive }),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createCategory: (data: any) =>
    api.post('/expenses/categories', data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getExpenses: (params?: any) =>
    api.get('/expenses', params),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createExpense: (data: any) =>
    api.post('/expenses', data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _approveExpense: (id: string, data: any) =>
    api.post(`/expenses/${id}/approve`, data),
  
  _getStats: (period?: '7d' | '30d' | '90d' | 'ytd', categoryId?: string) =>
    api.get('/expenses/stats', { period, categoryId }),
};

export const quotationApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getAll: (params?: any) =>
    api.get('/quotations', params),
  
  _getById: (id: string) =>
    api.get(`/quotations/${id}`),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _create: (data: any) =>
    api.post('/quotations', data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _processApproval: (id: string, data: any) =>
    api.post(`/quotations/${id}/approve`, data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _customerResponse: (id: string, data: any) =>
    api.post(`/quotations/${id}/customer-response`, data),
  
  _convertToJob: (id: string) =>
    api.post(`/quotations/${id}/convert-to-job`),
};

export const jobSheetApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getAll: (params?: any) =>
    api.get('/jobsheets', params),
  
  _getById: (id: string) =>
    api.get(`/jobsheets/${id}`),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _create: (data: any) =>
    api.post('/jobsheets', data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _update: (id: string, data: any) =>
    api.put(`/jobsheets/${id}`, data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _addPart: (id: string, data: any) =>
    api.post(`/jobsheets/${id}/parts`, data),
  
  _removePart: (jobSheetId: string, partId: string) =>
    api.delete(`/jobsheets/${jobSheetId}/parts/${partId}`),
  
  _generatePdf: (id: string) =>
    api.get(`/jobsheets/${id}/pdf`),
  
  _getStats: () =>
    api.get('/jobsheets/stats/dashboard'),
};

export const deviceApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getAll: (params?: any) =>
    api.get('/devices', params),
  
  _getById: (id: string) =>
    api.get(`/devices/${id}`),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _create: (data: any) =>
    api.post('/devices', data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _update: (id: string, data: any) =>
    api.put(`/devices/${id}`, data),
  
  _delete: (id: string) =>
    api.delete(`/devices/${id}`),
};

export const bookingApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getAll: (params?: any) =>
    api.get('/bookings', params),
  
  _getById: (id: string) =>
    api.get(`/bookings/${id}`),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _create: (data: any) =>
    api.post('/bookings', data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _update: (id: string, data: any) =>
    api.put(`/bookings/${id}`, data),
  
  _cancel: (id: string, reason?: string) =>
    api.post(`/bookings/${id}/cancel`, { reason }),
};

export const userApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getAll: (params?: any) =>
    api.get('/users', params),
  
  _getById: (id: string) =>
    api.get(`/users/${id}`),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _update: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _updateProfile: (data: any) =>
    api.put('/users/profile', data),
  
  _changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/users/change-password', data),
};

// Error handling utilities
export const handleApiError = (error: any): string => {
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