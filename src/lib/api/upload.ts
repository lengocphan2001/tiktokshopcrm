import { API_CONFIG, API_ENDPOINTS } from '@/config/api'

export interface UploadResponse {
  success: boolean
  message: string
  data?: {
    filename: string
    path: string
    size: number
    mimetype: string
  }
}

class UploadApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
        throw new Error(data.message || 'Upload failed')
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error')
    }
  }

  async uploadAvatar(token: string, file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('avatar', file)

    return this.request<UploadResponse>(API_ENDPOINTS.UPLOAD.AVATAR, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
  }
}

export const uploadApi = new UploadApi() 