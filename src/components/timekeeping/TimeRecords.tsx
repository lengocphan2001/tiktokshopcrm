'use client';

import * as React from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface TimeRecordsProps {
  userId: string
}

interface TimeRecord {
  id: string
  status: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'BREAK_START' | 'BREAK_END'
  clockInAt?: string
  clockOutAt?: string
  breakStartAt?: string
  breakEndAt?: string
  totalHours?: number
  breakHours?: number
  workHours?: number
  notes?: string
  location?: string
  createdAt: string
  updatedAt: string
}

export const TimeRecords: React.FC<TimeRecordsProps> = ({ userId }) => {
  const [records, setRecords] = React.useState<TimeRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string>('')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [total, setTotal] = React.useState(0)
  const [filters, setFilters] = React.useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: '' as string,
  })

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token')
    }
    return null
  }

  // Fetch time records
  const fetchRecords = React.useCallback(async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      })

      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString())
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString())
      }
      if (filters.status) {
        params.append('status', filters.status)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/time-records?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch time records')
      }

      const data = await response.json()
      setRecords(data.data)
      setTotal(data.pagination.total)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch time records')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, filters])

  // Load records on mount and when filters change
  React.useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOCKED_IN':
        return 'success'
      case 'CLOCKED_OUT':
        return 'error'
      case 'BREAK_START':
        return 'warning'
      case 'BREAK_END':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CLOCKED_IN':
        return 'Clocked In'
      case 'CLOCKED_OUT':
        return 'Clocked Out'
      case 'BREAK_START':
        return 'Break Start'
      case 'BREAK_END':
        return 'Break End'
      default:
        return status
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (hours?: number) => {
    if (!hours) return '-'
    return `${hours.toFixed(2)}h`
  }

  if (loading && records.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Time Records
      </Typography>

      {/* Filters */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(newValue) => handleFilterChange('startDate', newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(newValue) => handleFilterChange('endDate', newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="CLOCKED_IN">Clocked In</MenuItem>
                <MenuItem value="CLOCKED_OUT">Clocked Out</MenuItem>
                <MenuItem value="BREAK_START">Break Start</MenuItem>
                <MenuItem value="BREAK_END">Break End</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </LocalizationProvider>

      {/* Records Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Clock In</TableCell>
              <TableCell>Clock Out</TableCell>
              <TableCell>Break Start</TableCell>
              <TableCell>Break End</TableCell>
              <TableCell>Total Hours</TableCell>
              <TableCell>Break Hours</TableCell>
              <TableCell>Work Hours</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {formatDateTime(record.createdAt)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(record.status)}
                    color={getStatusColor(record.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {record.clockInAt ? formatDateTime(record.clockInAt) : '-'}
                </TableCell>
                <TableCell>
                  {record.clockOutAt ? formatDateTime(record.clockOutAt) : '-'}
                </TableCell>
                <TableCell>
                  {record.breakStartAt ? formatDateTime(record.breakStartAt) : '-'}
                </TableCell>
                <TableCell>
                  {record.breakEndAt ? formatDateTime(record.breakEndAt) : '-'}
                </TableCell>
                <TableCell>
                  {formatDuration(record.totalHours)}
                </TableCell>
                <TableCell>
                  {formatDuration(record.breakHours)}
                </TableCell>
                <TableCell>
                  {formatDuration(record.workHours)}
                </TableCell>
                <TableCell>
                  {record.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  )
}
