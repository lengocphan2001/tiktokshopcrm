import axios from 'axios'
import crypto from 'crypto'
import {
  TikTokShopApiConfig,
  TikTokShopProduct,
  TikTokShopOrder,
  TikTokShopApiResponse,
  TikTokShopProductsResponse,
  TikTokShopOrdersResponse,
  TikTokShopStats,
  CreateTikTokShopProductRequest,
  UpdateTikTokShopProductRequest
} from '../types/tiktokShop'

export class TikTokShopService {
  private config: TikTokShopApiConfig

  constructor() {
    this.config = {
      appKey: process.env.TIKTOK_SHOP_APP_KEY || '',
      appSecret: process.env.TIKTOK_SHOP_APP_SECRET || '',
      accessToken: process.env.TIKTOK_SHOP_ACCESS_TOKEN || '',
      shopId: process.env.TIKTOK_SHOP_ID || '',
      baseUrl: process.env.TIKTOK_SHOP_BASE_URL || 'https://open-api.tiktokglobalshop.com'
    }
  }

  private generateSignature(timestamp: string, method: string, path: string, body: string = ''): string {
    const message = `${this.config.appKey}${timestamp}${this.config.accessToken}${method}${path}${body}`
    return crypto.createHmac('sha256', this.config.appSecret).update(message).digest('hex')
  }

  private async makeRequest<T>(
    method: string,
    path: string,
    data?: any
  ): Promise<TikTokShopApiResponse<T>> {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const body = data ? JSON.stringify(data) : ''
    const signature = this.generateSignature(timestamp, method, path, body)

    const headers = {
      'Content-Type': 'application/json',
      'X-TT-ACCESS-TOKEN': this.config.accessToken,
      'X-TT-TIMESTAMP': timestamp,
      'X-TT-SIGNATURE': signature,
      'X-TT-APP-KEY': this.config.appKey
    }

    try {
      const response = await axios({
        method,
        url: `${this.config.baseUrl}${path}`,
        headers,
        data: data ? JSON.stringify(data) : undefined
      })

      return response.data
    } catch (error: any) {

      throw new Error(`TikTok Shop API Error: ${error.response?.data?.message || error.message}`)
    }
  }

  // Get products
  async getProducts(page: number = 1, pageSize: number = 20): Promise<TikTokShopProductsResponse> {
    const path = `/api/v2/product/products`
    const params = {
      page_no: page,
      page_size: pageSize,
      shop_id: this.config.shopId
    }

    const response = await this.makeRequest<{ products: TikTokShopProduct[], total: number }>(
      'GET',
      `${path}?${new URLSearchParams({
        page_no: params.page_no.toString(),
        page_size: params.page_size.toString(),
        shop_id: params.shop_id
      }).toString()}`
    )

    return {
      products: response.data.products || [],
      total: response.data.total || 0,
      page,
      pageSize
    }
  }

  // Get product by ID
  async getProduct(productId: string): Promise<TikTokShopProduct> {
    const path = `/api/v2/product/products/${productId}`
    const params = { shop_id: this.config.shopId }

    const response = await this.makeRequest<{ product: TikTokShopProduct }>(
      'GET',
      `${path}?${new URLSearchParams(params).toString()}`
    )

    return response.data.product
  }

  // Create product
  async createProduct(productData: CreateTikTokShopProductRequest): Promise<TikTokShopProduct> {
    const path = `/api/v2/product/products`
    const data = {
      ...productData,
      shop_id: this.config.shopId
    }

    const response = await this.makeRequest<{ product: TikTokShopProduct }>(
      'POST',
      path,
      data
    )

    return response.data.product
  }

  // Update product
  async updateProduct(productId: string, productData: UpdateTikTokShopProductRequest): Promise<TikTokShopProduct> {
    const path = `/api/v2/product/products/${productId}`
    const data = {
      ...productData,
      shop_id: this.config.shopId
    }

    const response = await this.makeRequest<{ product: TikTokShopProduct }>(
      'PUT',
      path,
      data
    )

    return response.data.product
  }

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    const path = `/api/v2/product/products/${productId}`
    const data = { shop_id: this.config.shopId }

    await this.makeRequest('DELETE', path, data)
  }

  // Get orders
  async getOrders(page: number = 1, pageSize: number = 20): Promise<TikTokShopOrdersResponse> {
    const path = `/api/v2/order/orders`
    const params = {
      page_no: page,
      page_size: pageSize,
      shop_id: this.config.shopId
    }

    const response = await this.makeRequest<{ orders: TikTokShopOrder[], total: number }>(
      'GET',
      `${path}?${new URLSearchParams({
        page_no: params.page_no.toString(),
        page_size: params.page_size.toString(),
        shop_id: params.shop_id
      }).toString()}`
    )

    return {
      orders: response.data.orders || [],
      total: response.data.total || 0,
      page,
      pageSize
    }
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<TikTokShopOrder> {
    const path = `/api/v2/order/orders/${orderId}`
    const params = { shop_id: this.config.shopId }

    const response = await this.makeRequest<{ order: TikTokShopOrder }>(
      'GET',
      `${path}?${new URLSearchParams(params).toString()}`
    )

    return response.data.order
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<TikTokShopOrder> {
    const path = `/api/v2/order/orders/${orderId}/status`
    const data = {
      status,
      shop_id: this.config.shopId
    }

    const response = await this.makeRequest<{ order: TikTokShopOrder }>(
      'PUT',
      path,
      data
    )

    return response.data.order
  }

  // Get shop statistics
  async getShopStats(): Promise<TikTokShopStats> {
    const path = `/api/v2/shop/stats`
    const params = { shop_id: this.config.shopId }

    const response = await this.makeRequest<{
      total_products: number
      total_orders: number
      total_revenue: number
      currency: string
      recent_orders: TikTokShopOrder[]
      top_products: TikTokShopProduct[]
    }>(
      'GET',
      `${path}?${new URLSearchParams(params).toString()}`
    )

    return {
      totalProducts: response.data.total_products || 0,
      totalOrders: response.data.total_orders || 0,
      totalRevenue: response.data.total_revenue || 0,
      currency: response.data.currency || 'USD',
      recentOrders: response.data.recent_orders || [],
      topProducts: response.data.top_products || []
    }
  }

  // Check API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getShopStats()
      return true
    } catch (error) {

      return false
    }
  }
}

export const tiktokShopService = new TikTokShopService()
