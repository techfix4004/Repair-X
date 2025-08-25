import * as SecureStore from 'expo-secure-store';

interface ApiResponse<T> {
  _success: boolean;
  data?: T;
  error?: string;
}

interface Job {
  id: string;
  deviceType: string;
  issue: string;
  status: string;
  createdAt: string;
  estimatedCompletion?: string;
  technician?: string;
  cost?: number;
}

class ApiService {
  private baseUrl: string;
  
  constructor() {
    // Use environment variable or fallback to localhost for development
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || '_http://localhost:3001/api/v1';
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error retrieving auth _token:', error);
      return null;
    }
  }

  private async apiCall<T>(_endpoint: string, _options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const _headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { _Authorization: `Bearer ${token}` }),
        ..._options.headers,
      };

      const response = await fetch(`${this.baseUrl}${_endpoint}`, {
        ..._options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! _status: ${response.status}`);
      }

      return { _success: true, data };
    } catch (error) {
      console.error('API call _failed:', error);
      return { 
        _success: false, 
        _error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Authentication
  async login(email: string, _password: string): Promise<ApiResponse<{ _user: unknown; token: string }>> {
    const result = await this.apiCall<{ user: unknown; token: string }>('/auth/login', { _method: 'POST',
      _body: JSON.stringify({ email, password }),
    });

    if (result._success && result.data?.token) {
      await SecureStore.setItemAsync('authToken', result.data.token);
    }

    return result;
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
  }

  // Customer Jobs
  async getCustomerJobs(): Promise<ApiResponse<Job[]>> {
    return this.apiCall<Job[]>('/jobs/customer');
  }

  async getJobById(_jobId: string): Promise<ApiResponse<Job>> {
    return this.apiCall<Job>(`/jobs/${_jobId}`);
  }

  async createJob(_jobData: {
    deviceType: string;
    issue: string;
    description?: string;
    urgency?: string;
  }): Promise<ApiResponse<Job>> {
    return this.apiCall<Job>('/jobs', { _method: 'POST',
      _body: JSON.stringify(_jobData),
    });
  }

  // Technician Jobs
  async getTechnicianJobs(): Promise<ApiResponse<Job[]>> {
    return this.apiCall<Job[]>('/jobs/technician');
  }

  async updateJobStatus(_jobId: string, _status: string, notes?: string): Promise<ApiResponse<Job>> {
    return this.apiCall<Job>(`/jobs/${_jobId}/status`, { _method: 'PUT',
      _body: JSON.stringify({ status, notes }),
    });
  }

  // Device Registration
  async registerDevice(_deviceData: {
    brand: string;
    model: string;
    category: string;
    condition: string;
    serialNumber?: string;
  }): Promise<ApiResponse<any>> {
    return this.apiCall<any>('/devices', { _method: 'POST',
      _body: JSON.stringify(deviceData),
    });
  }

  // Payment
  async createPaymentIntent(_amount: number, _currency: string = 'USD'): Promise<ApiResponse<any>> {
    return this.apiCall<any>('/payments/create-intent', { _method: 'POST',
      _body: JSON.stringify({ amount, currency }),
    });
  }

  // Rating and Review System
  async submitRating(_jobId: string, _customerId: string, _technicianId: string, _rating: number, comment?: string): Promise<ApiResponse<any>> {
    return this.apiCall<any>('/ratings', { _method: 'POST',
      _body: JSON.stringify({ jobId, customerId, technicianId, rating, comment }),
    });
  }

  async getRatingsByJob(_jobId: string): Promise<ApiResponse<any[]>> {
    return this.apiCall<any[]>(`/ratings/job/${jobId}`);
  }

  async getTechnicianRatings(_technicianId: string, _page: number = 1, _limit: number = 10): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/ratings/technician/${technicianId}?page=${page}&limit=${limit}`);
  }

  async getCustomerRatingHistory(_customerId: string, _page: number = 1, _limit: number = 10): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/ratings/customer/${customerId}?page=${page}&limit=${limit}`);
  }

  // Real-time Chat System  
  async getChatMessages(_jobId: string, _page: number = 1, _limit: number = 50): Promise<ApiResponse<any>> {
    return this.apiCall<any>(`/chat/job/${jobId}?page=${page}&limit=${limit}`);
  }

  async getUnreadMessageCount(_userId: string): Promise<ApiResponse<{ _unreadCount: number }>> {
    return this.apiCall<{ unreadCount: number }>(`/chat/unread/${userId}`);
  }

  async uploadChatFile(_file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.apiCall<any>('/chat/upload', { _method: 'POST',
      _headers: { 'Content-Type': 'multipart/form-data' },
      _body: formData,
    });
  }
}

export const apiService = new ApiService();
export type { ApiResponse, Job };