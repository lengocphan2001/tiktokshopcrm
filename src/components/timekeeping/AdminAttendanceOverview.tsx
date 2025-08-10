'use client';

import * as React from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { AttendanceStatus } from '@/types/attendance'

interface AdminAttendanceOverviewProps {
  isAdmin: boolean
}

interface UserAttendanceData {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  attendance: {
    year: number
    month: number
    days: Array<{
      date: string
      dayOfWeek: number
      isToday: boolean
      isPast: boolean
      isFuture: boolean
      status?: AttendanceStatus
      notes?: string
    }>
  }
  stats: {
    totalDays: number
    presentDays: number
    absentDays: number
    lateDays: number
    halfDays: number
    attendanceRate: number
    currentMonthStats: {
      totalDays: number
      presentDays: number
      absentDays: number
      lateDays: number
      halfDays: number
      attendanceRate: number
    }
  }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUS_COLORS = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  HALF_DAY: 'info',
} as const

const STATUS_LABELS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  HALF_DAY: 'Half Day',
} as const

export const AdminAttendanceOverview: React.FC<AdminAttendanceOverviewProps> = ({ isAdmin }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [attendanceData, setAttendanceData] = React.useState<UserAttendanceData[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string>('')
  const [selectedUser, setSelectedUser] = React.useState<string>('')

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  // Fetch all users attendance data
  const fetchAllUsersAttendance = React.useCallback(async () => {
    if (!isAdmin) return

    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/attendance/all-users?year=${currentYear}&month=${currentMonth}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data')
      }

      const data = await response.json()
      setAttendanceData(data.data)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }, [currentYear, currentMonth, isAdmin])

  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Load attendance data when month changes
  React.useEffect(() => {
    fetchAllUsersAttendance()
  }, [fetchAllUsersAttendance])

  if (!isAdmin) {
    return null
  }

  if (loading && attendanceData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  const selectedUserData = selectedUser 
    ? attendanceData.find(data => data.user.id === selectedUser)
    : null

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Admin Attendance Overview - {MONTHS[currentMonth - 1]} {currentYear}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handlePreviousMonth} disabled={loading}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNextMonth} disabled={loading}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* User Selection */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select User</InputLabel>
          <Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            label="Select User"
          >
            <MenuItem value="">All Users</MenuItem>
            {attendanceData.map((data) => (
              <MenuItem key={data.user.id} value={data.user.id}>
                {data.user.firstName} {data.user.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {attendanceData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Attendance Rate
              </Typography>
              <Typography variant="h4">
                {attendanceData.length > 0 
                  ? (attendanceData.reduce((sum, data) => sum + data.stats.currentMonthStats.attendanceRate, 0) / attendanceData.length).toFixed(1)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Most Present
              </Typography>
              <Typography variant="h4">
                {attendanceData.length > 0 
                  ? Math.max(...attendanceData.map(data => data.stats.currentMonthStats.presentDays))
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Most Absent
              </Typography>
              <Typography variant="h4">
                {attendanceData.length > 0 
                  ? Math.max(...attendanceData.map(data => data.stats.currentMonthStats.absentDays))
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell align="center">Present Days</TableCell>
              <TableCell align="center">Absent Days</TableCell>
              <TableCell align="center">Late Days</TableCell>
              <TableCell align="center">Half Days</TableCell>
              <TableCell align="center">Attendance Rate</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.map((data) => (
              <TableRow key={data.user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {data.user.avatar && (
                      <Box
                        component="img"
                        src={data.user.avatar}
                        alt={`${data.user.firstName} ${data.user.lastName}`}
                        sx={{ width: 40, height: 40, borderRadius: '50%' }}
                      />
                    )}
                    <Box>
                      <Typography variant="subtitle2">
                        {data.user.firstName} {data.user.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {data.user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={data.stats.currentMonthStats.presentDays}
                    color="success"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={data.stats.currentMonthStats.absentDays}
                    color="error"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={data.stats.currentMonthStats.lateDays}
                    color="warning"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={data.stats.currentMonthStats.halfDays}
                    color="info"
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" color="textSecondary">
                    {data.stats.currentMonthStats.attendanceRate.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => setSelectedUser(data.user.id)}
                    color={selectedUser === data.user.id ? 'primary' : 'default'}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Selected User Calendar View */}
      {selectedUserData && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {selectedUserData.user.firstName} {selectedUserData.user.lastName} - {MONTHS[currentMonth - 1]} {currentYear}
          </Typography>
          
          <Grid container spacing={1}>
            {selectedUserData.attendance.days.map((day) => (
              <Grid item xs key={day.date}>
                <Box
                  sx={{
                    p: 1,
                    minHeight: 40,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: day.isToday ? 'action.hover' : 'background.paper',
                    position: 'relative',
                  }}
                >
                  <Typography variant="caption" sx={{ mb: 0.5 }}>
                    {new Date(day.date).getDate()}
                  </Typography>
                  
                  {day.status && (
                    <Chip
                      label={STATUS_LABELS[day.status]}
                      color={STATUS_COLORS[day.status]}
                      size="small"
                      variant="filled"
                      sx={{ fontSize: '0.6rem', height: 16 }}
                    />
                  )}
                  
                  {day.notes && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                      }}
                    />
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  )
}
