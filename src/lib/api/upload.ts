import { API_CONFIG, API_ENDPOINTS } from '@/config/api'

export interface UploadData {
  filename: string
  path: string
  size: number
  mimetype: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

class UploadApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Upload failed',
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

  async uploadAvatar(token: string, file: File): Promise<ApiResponse<UploadData>> {
    const formData = new FormData()
    formData.append('avatar', file)

    return this.request<UploadData>(API_ENDPOINTS.UPLOAD.AVATAR, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
  }
}

export const uploadApi = new UploadApi() 