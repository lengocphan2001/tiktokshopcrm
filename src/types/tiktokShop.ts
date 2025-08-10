export interface TikTokShopProduct {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  images: string[]
  category: string
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  stock: number
  sku: string
  createdAt: string
  updatedAt: string
}

export interface TikTokShopOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  totalAmount: number
  currency: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  shippingAddress: {
    address: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  items: TikTokShopOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface TikTokShopOrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  sku: string
}

export interface TikTokShopStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  currency: string
  recentOrders: TikTokShopOrder[]
  topProducts: TikTokShopProduct[]
}

export interface TikTokShopProductsResponse {
  products: TikTokShopProduct[]
  total: number
  page: number
  pageSize: number
}

export interface TikTokShopOrdersResponse {
  orders: TikTokShopOrder[]
  total: number
  page: number
  pageSize: number
}

export interface CreateTikTokShopProductRequest {
  name: string
  description?: string
  price: number
  currency: string
  images: string[]
  category: string
  stock: number
  sku: string
}

export interface UpdateTikTokShopProductRequest {
  name?: string
  description?: string
  price?: number
  currency?: string
  images?: string[]
  category?: string
  stock?: number
  sku?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
}
