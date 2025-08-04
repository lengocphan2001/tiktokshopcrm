import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

export interface TaskType {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

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

export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  resource?: string;
  result?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  taskTypeId: string;
  taskType: TaskType;
  assigneeId: string;
  assignee: User;
  createdById: string;
  createdBy: User;
  updatedBy?: string;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  resource?: string;
  result?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isActive?: boolean;
  taskTypeId: string;
  assigneeId: string;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  resource?: string;
  result?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isActive?: boolean;
  taskTypeId?: string;
  assigneeId?: string;
}

export interface PaginatedTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

class TasksApi {
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

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'API request failed',
          data: undefined
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: undefined
      };
    }
  }

  async getTasks(token: string, params: any = {}): Promise<ApiResponse<PaginatedTasksResponse>> {
    return this.request<PaginatedTasksResponse>(API_ENDPOINTS.TASKS.LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }

  async getTaskById(token: string, taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.UPDATE(taskId), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createTask(token: string, taskData: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(token: string, taskId: string, taskData: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.UPDATE(taskId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(token: string, taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TASKS.DELETE(taskId), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async activateTask(token: string, taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.ACTIVATE(taskId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deactivateTask(token: string, taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.DEACTIVATE(taskId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateTaskStatus(token: string, taskId: string, status: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.UPDATE_STATUS(taskId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  }

  async updateTaskResult(token: string, taskId: string, result: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.UPDATE_RESULT(taskId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ result }),
    });
  }

  async getTasksByAssignee(token: string, assigneeId: string, params: any = {}): Promise<ApiResponse<PaginatedTasksResponse>> {
    return this.request<PaginatedTasksResponse>(API_ENDPOINTS.TASKS.BY_ASSIGNEE(assigneeId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
  }
}

export const tasksApi = new TasksApi(); 