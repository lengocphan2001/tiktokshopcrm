import { API_CONFIG, API_ENDPOINTS } from '@/config/api'

export interface Task {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  resource?: string
  result?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  isActive: boolean
  createdAt: string
  updatedAt: string
  taskTypeId: string
  taskType: {
    id: string
    name: string
    price: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    createdBy?: string
    updatedBy?: string
  }
  assigneeId: string
  assignee: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: 'ADMIN' | 'USER'
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  createdById: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: 'ADMIN' | 'USER'
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  updatedBy?: string
}

export interface CreateTaskRequest {
  name: string
  description?: string
  startDate: string
  endDate: string
  resource?: string
  result?: string
  taskTypeId: string
  assigneeId: string
}

export interface UpdateTaskRequest {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  resource?: string
  result?: string
  taskTypeId?: string
  assigneeId?: string
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
}

export interface PaginatedTasksResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

class TasksApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    }
    
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        let errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`
        
        if (data.errors && Array.isArray(data.errors)) {
          errorMessage = JSON.stringify(data)
        }
        
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error')
    }
  }

  async getTasks(token: string, queryParams: string = ''): Promise<ApiResponse<PaginatedTasksResponse>> {
    const endpoint = `${API_ENDPOINTS.TASKS.LIST}${queryParams ? `?${queryParams}` : ''}`
    const body = queryParams ? Object.fromEntries(new URLSearchParams(queryParams)) : { page: 1, limit: 10 };
    return this.request<PaginatedTasksResponse>(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
  }

  async getTaskById(token: string, taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.UPDATE(taskId), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async createTask(token: string, taskData: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.CREATE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    })
  }

  async updateTask(token: string, taskId: string, taskData: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.UPDATE(taskId), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    })
  }

  async deleteTask(token: string, taskId: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TASKS.DELETE(taskId), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async activateTask(token: string, taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.ACTIVATE(taskId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async deactivateTask(token: string, taskId: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.DEACTIVATE(taskId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async updateTaskStatus(token: string, taskId: string, status: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.UPDATE_STATUS(taskId), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
  }

  async updateTaskResult(token: string, taskId: string, result: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(API_ENDPOINTS.TASKS.UPDATE_RESULT(taskId), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ result }),
    })
  }

  async getTasksByAssignee(token: string, assigneeId: string, queryParams: string = ''): Promise<ApiResponse<PaginatedTasksResponse>> {
    const endpoint = `${API_ENDPOINTS.TASKS.BY_ASSIGNEE(assigneeId)}${queryParams ? `?${queryParams}` : ''}`
    const body = queryParams ? Object.fromEntries(new URLSearchParams(queryParams)) : { page: 1, limit: 10 };
    return this.request<PaginatedTasksResponse>(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
  }
}

export const tasksApi = new TasksApi() 