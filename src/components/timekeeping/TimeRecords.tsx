'use client';

import * as React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Fade,
  useTheme,
  alpha,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material'
import {
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  PlayArrow as ClockInIcon,
  Stop as ClockOutIcon,
  Pause as BreakIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'

interface TimeRecordsProps {
  userId: string
}

interface TimeRecord {
  id: string
  status: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'BREAK_START' | 'BREAK_END'
  timestamp: string
  duration?: number
  notes?: string
}

interface TimeRecordsData {
  records: TimeRecord[]
  totalRecords: number
  currentPage: number
  totalPages: number
}

export const TimeRecords: React.FC<TimeRecordsProps> = ({ userId }) => {
  const theme = useTheme()
  const [records, setRecords] = React.useState<TimeRecordsData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string>('')

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
      const token = getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/time-records?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch time records')
      }

      const data = await response.json()
      setRecords(data.data)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch time records')
    }
  }, [])

  // Load records on mount
  React.useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Mock data for demonstration
  const mockRecords: TimeRecordsData = {
    records: [
      {
        id: '1',
        status: 'CLOCKED_IN',
        timestamp: '2024-01-15T09:00:00Z',
        duration: 480,
        notes: 'Started workday',
      },
      {
        id: '2',
        status: 'BREAK_START',
        timestamp: '2024-01-15T12:00:00Z',
        duration: 60,
        notes: 'Lunch break',
      },
      {
        id: '3',
        status: 'BREAK_END',
        timestamp: '2024-01-15T13:00:00Z',
        duration: 0,
        notes: 'Back from lunch',
      },
      {
        id: '4',
        status: 'CLOCKED_OUT',
        timestamp: '2024-01-15T17:00:00Z',
        duration: 0,
        notes: 'End of workday',
      },
      {
        id: '5',
        status: 'CLOCKED_IN',
        timestamp: '2024-01-16T08:30:00Z',
        duration: 510,
        notes: 'Early start today',
      },
      {
        id: '6',
        status: 'CLOCKED_OUT',
        timestamp: '2024-01-16T17:00:00Z',
        duration: 0,
        notes: 'Regular end time',
      },
    ],
    totalRecords: 6,
    currentPage: 1,
    totalPages: 1,
  }

  const recordsData = records || mockRecords

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CLOCKED_IN':
        return <ClockInIcon />
      case 'CLOCKED_OUT':
        return <ClockOutIcon />
      case 'BREAK_START':
        return <BreakIcon />
      case 'BREAK_END':
        return <ClockInIcon />
      default:
        return <TimeIcon />
    }
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

  const formatDuration = (minutes: number) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateTotalHours = () => {
    return recordsData.records
      .filter(record => record.duration && record.duration > 0)
      .reduce((total, record) => total + (record.duration || 0), 0)
  }

  const totalHours = calculateTotalHours()

  return (
    <Fade in={true} timeout={800}>
      <Box>
        {/* Header */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 4, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontSize: 32,
                }}
              >
                <ScheduleIcon />
              </Avatar>
            </Box>
            
            <Typography variant="h4" component="div" sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: 'primary.main',
            }}>
              Time Records
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              Detailed view of your work time and breaks
            </Typography>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <TimeIcon sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {Math.round(totalHours / 60 * 10) / 10}h
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Hours
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ fontSize: 32, color: 'info.main' }} />
                </Box>
                <Typography variant="h3" color="info.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {recordsData.totalRecords}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Records
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                </Box>
                <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {Math.round((totalHours / recordsData.records.length) * 10) / 10}m
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Avg Duration
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {recordsData.records.filter(r => r.status === 'CLOCKED_IN').length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Clock Ins
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Records Table */}
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon color="primary" />
                Recent Time Records
              </Typography>
            </Box>
            
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recordsData.records.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(record.status)}
                          label={getStatusLabel(record.status)}
                          color={getStatusColor(record.status) as any}
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatTimestamp(record.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(record.duration || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.notes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Record">
                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Record">
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Time Distribution Chart */}
        <Card elevation={0} sx={{ mt: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="info" />
              Time Distribution
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Work Time
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Math.round((totalHours / (totalHours + 60)) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(totalHours / (totalHours + 60)) * 100}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Break Time
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Math.round((60 / (totalHours + 60)) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(60 / (totalHours + 60)) * 100}
                    color="warning"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      Productive Work Time
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.warning.main, 0.05) }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: 'warning.main',
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      Break Time
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  )
}
