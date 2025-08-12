import { API_CONFIG, API_ENDPOINTS } from '@/config/api'

export interface TaskType {
  id: string
  name: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateTaskTypeRequest {
  name: string
  price: number
}

export interface UpdateTaskTypeRequest {
  name?: string
  price?: number
}

export interface PaginatedTaskTypesResponse {
  taskTypes: TaskType[]
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

class TaskTypesApi {
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
        
        return {
          success: false,
          message: errorMessage,
          data: undefined
        }
      }

      return data
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: undefined
      }
    }
  }

  async getTaskTypes(token: string, queryParams: string = ''): Promise<ApiResponse<PaginatedTaskTypesResponse>> {
    const endpoint = `${API_ENDPOINTS.TASK_TYPES.LIST}${queryParams ? `?${queryParams}` : ''}`
    return this.request<PaginatedTaskTypesResponse>(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getTaskTypeById(token: string, taskTypeId: string): Promise<ApiResponse<TaskType>> {
    return this.request<TaskType>(API_ENDPOINTS.TASK_TYPES.UPDATE(taskTypeId), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async createTaskType(token: string, taskTypeData: CreateTaskTypeRequest): Promise<ApiResponse<TaskType>> {
    return this.request<TaskType>(API_ENDPOINTS.TASK_TYPES.CREATE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskTypeData),
    })
  }

  async updateTaskType(token: string, taskTypeId: string, taskTypeData: UpdateTaskTypeRequest): Promise<ApiResponse<TaskType>> {
    return this.request<TaskType>(API_ENDPOINTS.TASK_TYPES.UPDATE(taskTypeId), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskTypeData),
    })
  }

  async deleteTaskType(token: string, taskTypeId: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TASK_TYPES.DELETE(taskTypeId), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async activateTaskType(token: string, taskTypeId: string): Promise<ApiResponse<TaskType>> {
    return this.request<TaskType>(API_ENDPOINTS.TASK_TYPES.ACTIVATE(taskTypeId), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async deactivateTaskType(token: string, taskTypeId: string): Promise<ApiResponse<TaskType>> {
    return this.request<TaskType>(API_ENDPOINTS.TASK_TYPES.DEACTIVATE(taskTypeId), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }
}

export const taskTypesApi = new TaskTypesApi() 