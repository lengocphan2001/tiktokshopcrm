'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material'
import {
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { tiktokShopApi } from '../../../lib/api/tiktokShop'
import { TikTokShopStats, TikTokShopProduct, TikTokShopOrder } from '../../../types/tiktokShop'

export default function TikTokShopDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<TikTokShopStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Test connection first
      const connectionResponse = await tiktokShopApi.testConnection()
      setConnectionStatus(connectionResponse.success)

      if (connectionResponse.success) {
        const statsData = await tiktokShopApi.getShopStats()
        setStats(statsData)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
      setConnectionStatus(false)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PAID':
      case 'DELIVERED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'CANCELLED':
      case 'FAILED':
      case 'REFUNDED':
        return 'error'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        TikTok Shop Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {connectionStatus === false && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          TikTok Shop API connection failed. Please check your API credentials in the backend configuration.
        </Alert>
      )}

      {connectionStatus === true && stats && (
        <>
          {/* Stats Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InventoryIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Products</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {stats.totalProducts}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShoppingCartIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Orders</Typography>
                  </Box>
                  <Typography variant="h4" color="secondary">
                    {stats.totalOrders}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MoneyIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Revenue</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(stats.totalRevenue, stats.currency)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="h6">Currency</Typography>
                  </Box>
                  <Typography variant="h4" color="info.main">
                    {stats.currency}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<InventoryIcon />}
              onClick={() => router.push('/dashboard/tiktok-shop/products')}
            >
              Manage Products
            </Button>
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={() => router.push('/dashboard/tiktok-shop/orders')}
            >
              View Orders
            </Button>
          </Box>

          {/* Recent Orders */}
          {stats.recentOrders.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {stats.recentOrders.slice(0, 5).map((order) => (
                      <Box
                        key={order.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          flex: 1
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {order.customerName} • {order.customerEmail}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(order.totalAmount, order.currency)}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip
                              label={order.status}
                              color={getStatusColor(order.status) as any}
                              size="small"
                            />
                            <Chip
                              label={order.paymentStatus}
                              color={getStatusColor(order.paymentStatus) as any}
                              size="small"
                            />
                          </Stack>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Top Products */}
          {stats.topProducts.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Products
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {stats.topProducts.slice(0, 5).map((product) => (
                      <Box
                        key={product.id}
                        sx={{
                          flex: 1,
                          minWidth: { sm: 200, md: 250 }
                        }}
                      >
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                  {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  SKU: {product.sku}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Stock: {product.stock}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" fontWeight="bold">
                                  {formatCurrency(product.price, product.currency)}
                                </Typography>
                                <Chip
                                  label={product.status}
                                  color={getStatusColor(product.status) as any}
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {connectionStatus === null && !loading && (
        <Alert severity="info">
          Unable to connect to TikTok Shop API. Please check your configuration.
        </Alert>
      )}
    </Box>
  )
}
