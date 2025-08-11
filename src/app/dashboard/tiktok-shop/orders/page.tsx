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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { tiktokShopApi } from '../../../../lib/api/tiktokShop'
import { TikTokShopOrder, TikTokShopOrdersResponse } from '../../../../types/tiktokShop'

export default function TikTokShopOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<TikTokShopOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(20)
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<TikTokShopOrder | null>(null)
  const [statusUpdate, setStatusUpdate] = useState('')

  useEffect(() => {
    loadOrders()
  }, [page])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await tiktokShopApi.getOrders(page, pageSize)
      setOrders(response.orders)
      setTotal(response.total)
      setTotalPages(Math.ceil(response.total / pageSize))
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order: TikTokShopOrder) => {
    setSelectedOrder(order)
    setStatusUpdate(order.status)
    setDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return
    
    try {
      await tiktokShopApi.updateOrderStatus(selectedOrder.id, statusUpdate)
      setDialogOpen(false)
      loadOrders()
    } catch (err: any) {
      setError(err.message || 'Failed to update order status')
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
      case 'DELIVERED':
      case 'PAID':
        return 'success'
      case 'PENDING':
      case 'CONFIRMED':
        return 'warning'
      case 'CANCELLED':
      case 'FAILED':
      case 'REFUNDED':
        return 'error'
      default:
        return 'default'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'PENDING':
        return 'warning'
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push('/dashboard/tiktok-shop')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          TikTok Shop Orders
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Total Orders: {total}
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {order.orderNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {order.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.customerEmail}
                  </Typography>
                  {order.customerPhone && (
                    <Typography variant="body2" color="text.secondary">
                      {order.customerPhone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {formatCurrency(order.totalAmount, order.currency)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={order.paymentStatus} 
                    color={getPaymentStatusColor(order.paymentStatus) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewOrder(order)}
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - {selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography><strong>Name:</strong> {selectedOrder.customerName}</Typography>
                    <Typography><strong>Email:</strong> {selectedOrder.customerEmail}</Typography>
                    {selectedOrder.customerPhone && (
                      <Typography><strong>Phone:</strong> {selectedOrder.customerPhone}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Shipping Address
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography>{selectedOrder.shippingAddress.address}</Typography>
                    <Typography>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                    </Typography>
                    <Typography>{selectedOrder.shippingAddress.country}</Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <List>
                      {selectedOrder.items.map((item, index) => (
                        <Box key={item.id}>
                          <ListItem>
                            <ListItemText
                              primary={item.productName}
                              secondary={`SKU: ${item.sku} • Qty: ${item.quantity}`}
                            />
                            <Typography variant="subtitle2" fontWeight="bold">
                              {formatCurrency(item.totalPrice, selectedOrder.currency)}
                            </Typography>
                          </ListItem>
                          {index < selectedOrder.items.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="h6" fontWeight="bold">
                        Total: {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <FormControl fullWidth>
                    <InputLabel>Order Status</InputLabel>
                    <Select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      label="Order Status"
                    >
                      <MenuItem value="PENDING">PENDING</MenuItem>
                      <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
                      <MenuItem value="SHIPPED">SHIPPED</MenuItem>
                      <MenuItem value="DELIVERED">DELIVERED</MenuItem>
                      <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                      <MenuItem value="REFUNDED">REFUNDED</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={`Order: ${selectedOrder.status}`} 
                      color={getStatusColor(selectedOrder.status) as any}
                    />
                    <Chip 
                      label={`Payment: ${selectedOrder.paymentStatus}`} 
                      color={getPaymentStatusColor(selectedOrder.paymentStatus) as any}
                    />
                  </Stack>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
