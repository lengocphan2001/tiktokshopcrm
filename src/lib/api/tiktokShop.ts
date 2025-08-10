import { API_CONFIG, API_ENDPOINTS } from '@/config/api'
import {
  TikTokShopProduct,
  TikTokShopOrder,
  TikTokShopStats,
  TikTokShopProductsResponse,
  TikTokShopOrdersResponse,
  CreateTikTokShopProductRequest,
  UpdateTikTokShopProductRequest
} from '@/types/tiktokShop'

export interface TikTokShopApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errors?: any[]
}

class TikTokShopApi {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token')
    }
    return null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const token = this.getAuthToken()
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error')
    }
  }

  // Test API connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    return this.request(API_ENDPOINTS.TIKTOK_SHOP.TEST_CONNECTION, {
      method: 'GET',
    })
  }

  // Get shop statistics
  async getShopStats(): Promise<TikTokShopStats> {
    return this.request(API_ENDPOINTS.TIKTOK_SHOP.STATS, {
      method: 'GET',
    })
  }

  // Get products
  async getProducts(page: number = 1, pageSize: number = 20): Promise<TikTokShopProductsResponse> {
    const url = `${API_ENDPOINTS.TIKTOK_SHOP.PRODUCTS}?page=${page}&pageSize=${pageSize}`
    return this.request(url, {
      method: 'GET',
    })
  }

  // Get product by ID
  async getProduct(productId: string): Promise<TikTokShopProduct> {
    return this.request(`/tiktok-shop/products/${productId}`, {
      method: 'GET',
    })
  }

  // Create product
  async createProduct(productData: CreateTikTokShopProductRequest): Promise<TikTokShopProduct> {
    return this.request(API_ENDPOINTS.TIKTOK_SHOP.CREATE_PRODUCT, {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  // Update product
  async updateProduct(productId: string, productData: UpdateTikTokShopProductRequest): Promise<TikTokShopProduct> {
    return this.request(API_ENDPOINTS.TIKTOK_SHOP.UPDATE_PRODUCT(productId), {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    return this.request(API_ENDPOINTS.TIKTOK_SHOP.DELETE_PRODUCT(productId), {
      method: 'DELETE',
    })
  }

  // Get orders
  async getOrders(page: number = 1, pageSize: number = 20): Promise<TikTokShopOrdersResponse> {
    const url = `${API_ENDPOINTS.TIKTOK_SHOP.ORDERS}?page=${page}&pageSize=${pageSize}`
    return this.request(url, {
      method: 'GET',
    })
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<TikTokShopOrder> {
    return this.request(API_ENDPOINTS.TIKTOK_SHOP.ORDER_DETAILS(orderId), {
      method: 'GET',
    })
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<TikTokShopOrder> {
    return this.request(API_ENDPOINTS.TIKTOK_SHOP.UPDATE_ORDER_STATUS(orderId), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }
}

export const tiktokShopApi = new TikTokShopApi()
