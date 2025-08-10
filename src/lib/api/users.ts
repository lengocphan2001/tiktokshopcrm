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

    

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      

      if (!response.ok) {
        // Return the error response instead of throwing
        return {
          success: false,
          message: data.message || 'API request failed',
          data: undefined
        };
      }

      return data;
    } catch (error) {
      // Return error response instead of throwing
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: undefined
      };
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
    const requestBody = JSON.stringify(userData);
    
    const response = await this.request<User>(API_ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    return response;
  }

  async updateUser(token: string, userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.request<User>(API_ENDPOINTS.USERS.UPDATE(userId), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response;
  }

  async updateOwnProfile(token: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await this.request<User>(API_ENDPOINTS.USERS.PROFILE, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
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