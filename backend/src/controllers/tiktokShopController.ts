import { Request, Response } from 'express'
import { tiktokShopService } from '../services/tiktokShopService'
import { UserRole } from '../types/user'

// Middleware to check if user is admin
const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    })
  }
  next()
}

// Test TikTok Shop API connection
export const testConnection = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const isConnected = await tiktokShopService.testConnection()
      
      res.json({
        success: true,
        message: isConnected ? 'TikTok Shop API connection successful' : 'TikTok Shop API connection failed',
        data: { connected: isConnected }
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to test TikTok Shop API connection',
      error: error.message
    })
  }
}

// Get shop statistics
export const getShopStats = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const stats = await tiktokShopService.getShopStats()
      
      res.json({
        success: true,
        message: 'Shop statistics retrieved successfully',
        data: stats
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get shop statistics',
      error: error.message
    })
  }
}

// Get products
export const getProducts = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 20
      
      const products = await tiktokShopService.getProducts(page, pageSize)
      
      res.json({
        success: true,
        message: 'Products retrieved successfully',
        data: products
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message
    })
  }
}

// Get product by ID
export const getProduct = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const { productId } = req.params
      
      const product = await tiktokShopService.getProduct(productId)
      
      res.json({
        success: true,
        message: 'Product retrieved successfully',
        data: product
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message
    })
  }
}

// Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const productData = req.body
      
      const product = await tiktokShopService.createProduct(productData)
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    })
  }
}

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const { productId } = req.params
      const productData = req.body
      
      const product = await tiktokShopService.updateProduct(productId, productData)
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    })
  }
}

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const { productId } = req.params
      
      await tiktokShopService.deleteProduct(productId)
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    })
  }
}

// Get orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 20
      
      const orders = await tiktokShopService.getOrders(page, pageSize)
      
      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    })
  }
}

// Get order by ID
export const getOrder = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const { orderId } = req.params
      
      const order = await tiktokShopService.getOrder(orderId)
      
      res.json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    })
  }
}

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    requireAdmin(req, res, async () => {
      const { orderId } = req.params
      const { status } = req.body
      
      const order = await tiktokShopService.updateOrderStatus(orderId, status)
      
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      })
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    })
  }
}
