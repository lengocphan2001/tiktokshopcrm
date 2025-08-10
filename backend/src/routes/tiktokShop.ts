import express from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  testConnection,
  getShopStats,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrder,
  updateOrderStatus
} from '../controllers/tiktokShopController'

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Test API connection
router.get('/test-connection', testConnection)

// Shop statistics
router.get('/stats', getShopStats)

// Product routes
router.get('/products', getProducts)
router.get('/products/:productId', getProduct)
router.post('/products', createProduct)
router.put('/products/:productId', updateProduct)
router.delete('/products/:productId', deleteProduct)

// Order routes
router.get('/orders', getOrders)
router.get('/orders/:orderId', getOrder)
router.put('/orders/:orderId/status', updateOrderStatus)

export default router
