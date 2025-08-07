'use client';

import * as React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon,
} from '@mui/icons-material'

interface TimeStatsProps {
  userId: string
}

interface TimeStats {
  totalWorkDays: number
  totalWorkHours: number
  averageWorkHours: number
  currentWeekHours: number
  currentMonthHours: number
  lastClockIn?: string
  isCurrentlyClockedIn: boolean
  isOnBreak: boolean
}

export const TimeStats: React.FC<TimeStatsProps> = ({ userId }) => {
  const [stats, setStats] = React.useState<TimeStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string>('')

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token')
    }
    return null
  }

  // Fetch time stats
  const fetchStats = React.useCallback(async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/time-records/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch time stats')
      }

      const data = await response.json()
      setStats(data.data)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch time stats')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load stats on mount
  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
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

  if (!stats) {
    return (
      <Alert severity="info">
        No time data available
      </Alert>
    )
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary' 
  }: {
    title: string
    value: string
    subtitle?: string
    icon: React.ReactNode
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning'
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            color: `${color}.main`, 
            mr: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" color={`${color}.main`} sx={{ mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Work Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Work Days"
            value={stats.totalWorkDays.toString()}
            subtitle="Days worked"
            icon={<WorkIcon />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Hours"
            value={`${stats.totalWorkHours.toFixed(1)}h`}
            subtitle="Lifetime work hours"
            icon={<TimeIcon />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Daily"
            value={`${stats.averageWorkHours.toFixed(1)}h`}
            subtitle="Hours per work day"
            icon={<TrendingIcon />}
            color="secondary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Week"
            value={`${stats.currentWeekHours.toFixed(1)}h`}
            subtitle="Current week hours"
            icon={<CalendarIcon />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <StatCard
            title="This Month"
            value={`${stats.currentMonthHours.toFixed(1)}h`}
            subtitle="Current month hours"
            icon={<CalendarIcon />}
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                Current Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  Status: {stats.isCurrentlyClockedIn ? '🟢 Clocked In' : '🔴 Not Clocked In'}
                </Typography>
                {stats.isOnBreak && (
                  <Typography variant="body1" color="warning.main">
                    Break: 🟡 On Break
                  </Typography>
                )}
                {stats.lastClockIn && (
                  <Typography variant="body2" color="text.secondary">
                    Last clock in: {new Date(stats.lastClockIn).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
