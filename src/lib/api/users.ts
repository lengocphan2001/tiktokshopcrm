import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bankAccount?: string;
  about?: string;
  address?: string;
  dateOfBirth?: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
  bankAccount?: string;
  about?: string;
  address?: string;
  dateOfBirth?: string;
  role?: 'ADMIN' | 'USER';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bankAccount?: string;
  about?: string;
  address?: string;
  dateOfBirth?: string;
  role?: 'ADMIN' | 'USER';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive?: boolean;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class UsersApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Ensure Content-Type is set correctly
    if (config.body && typeof config.body === 'string') {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
    }

    console.log('=== API REQUEST DEBUG ===');
    console.log('URL:', url);
    console.log('Method:', config.method);
    console.log('Headers:', JSON.stringify(config.headers, null, 2));
    console.log('Body:', config.body);
    console.log('Body type:', typeof config.body);
    console.log('Body length:', config.body ? config.body.toString().length : 0);
    console.log('========================');

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('=== API RESPONSE DEBUG ===');
      console.log('Status:', response.status);
      console.log('Response data:', data);
      console.log('========================');

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.log('=== API ERROR DEBUG ===');
      console.log('Error:', error);
      console.log('========================');
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  async getUsers(token: string, queryParams: string = ''): Promise<ApiResponse<PaginatedUsersResponse>> {
    const endpoint = `${API_ENDPOINTS.USERS.LIST}${queryParams ? `?${queryParams}` : ''}`;
    return this.request<PaginatedUsersResponse>(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUserById(token: string, userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USERS.UPDATE(userId), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createUser(token: string, userData: CreateUserRequest): Promise<ApiResponse<User>> {
    console.log('=== API CREATE USER DEBUG ===');
    console.log('User data to create:', userData);
    console.log('User data type:', typeof userData);
    console.log('User data keys:', Object.keys(userData));
    console.log('User data values:', Object.values(userData));
    console.log('JSON stringified:', JSON.stringify(userData));
    console.log('JSON stringified length:', JSON.stringify(userData).length);
    
    const requestBody = JSON.stringify(userData);
    console.log('Request body:', requestBody);
    console.log('Request body type:', typeof requestBody);
    
    const response = await this.request<User>(API_ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    console.log('API create response:', response);
    console.log('============================');
    
    return response;
  }

  async updateUser(token: string, userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    console.log('=== API UPDATE USER DEBUG ===');
    console.log('User ID:', userId);
    console.log('User data:', userData);
    console.log('Endpoint:', API_ENDPOINTS.USERS.UPDATE(userId));
    
    const response = await this.request<User>(API_ENDPOINTS.USERS.UPDATE(userId), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    
    console.log('API response:', response);
    console.log('============================');
    
    return response;
  }

  async deleteUser(token: string, userId: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.USERS.DELETE(userId), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async activateUser(token: string, userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USERS.ACTIVATE(userId), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deactivateUser(token: string, userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.USERS.DEACTIVATE(userId), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const usersApi = new UsersApi(); 