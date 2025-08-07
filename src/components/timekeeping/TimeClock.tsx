'use client';

import * as React from 'react'
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material'
import {
  PlayArrow as ClockInIcon,
  Stop as ClockOutIcon,
  Pause as BreakIcon,
  PlayArrow as ResumeIcon,
} from '@mui/icons-material'

interface TimeClockProps {
  userId: string
}

interface TimeStats {
  isCurrentlyClockedIn: boolean
  isOnBreak: boolean
  lastClockIn?: string
  currentWeekHours: number
  currentMonthHours: number
}

export const TimeClock: React.FC<TimeClockProps> = ({ userId }) => {
  const [stats, setStats] = React.useState<TimeStats | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string>('')
  const [currentTime, setCurrentTime] = React.useState(new Date())

  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
    }
  }, [])

  // Clock in
  const handleClockIn = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/time-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'CLOCKED_IN',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to clock in')
      }

      await fetchStats()
    } catch (error: any) {
      setError(error.message || 'Failed to clock in')
    } finally {
      setLoading(false)
    }
  }

  // Clock out
  const handleClockOut = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/time-records/clock-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to clock out')
      }

      await fetchStats()
    } catch (error: any) {
      setError(error.message || 'Failed to clock out')
    } finally {
      setLoading(false)
    }
  }

  // Start break
  const handleStartBreak = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/time-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'BREAK_START',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to start break')
      }

      await fetchStats()
    } catch (error: any) {
      setError(error.message || 'Failed to start break')
    } finally {
      setLoading(false)
    }
  }

  // End break
  const handleEndBreak = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = getAuthToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/time-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'BREAK_END',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to end break')
      }

      await fetchStats()
    } catch (error: any) {
      setError(error.message || 'Failed to end break')
    } finally {
      setLoading(false)
    }
  }

  // Load stats on mount
  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Time Clock
      </Typography>

      {/* Current Time Display */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h3" component="div" sx={{ fontFamily: 'monospace', mb: 1 }}>
          {formatTime(currentTime)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(currentTime)}
        </Typography>
      </Box>

      {/* Status Display */}
      {stats && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={stats.isCurrentlyClockedIn ? 'Clocked In' : 'Not Clocked In'}
              color={stats.isCurrentlyClockedIn ? 'success' : 'default'}
              variant={stats.isCurrentlyClockedIn ? 'filled' : 'outlined'}
            />
            {stats.isOnBreak && (
              <Chip
                label="On Break"
                color="warning"
                variant="filled"
              />
            )}
          </Box>
          
          {stats.lastClockIn && (
            <Typography variant="body2" color="text.secondary">
              Last clock in: {new Date(stats.lastClockIn).toLocaleString()}
            </Typography>
          )}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!stats?.isCurrentlyClockedIn ? (
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<ClockInIcon />}
            onClick={handleClockIn}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={20} /> : 'Clock In'}
          </Button>
        ) : (
          <>
            {!stats.isOnBreak ? (
              <>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  startIcon={<BreakIcon />}
                  onClick={handleStartBreak}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={20} /> : 'Start Break'}
                </Button>
                
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<ClockOutIcon />}
                  onClick={handleClockOut}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={20} /> : 'Clock Out'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ResumeIcon />}
                onClick={handleEndBreak}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={20} /> : 'End Break'}
              </Button>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Quick Stats */}
      {stats && (
        <Box>
          <Typography variant="h6" gutterBottom>
            This Week
          </Typography>
          <Typography variant="h4" color="primary">
            {stats.currentWeekHours.toFixed(1)}h
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            This Month
          </Typography>
          <Typography variant="h4" color="primary">
            {stats.currentMonthHours.toFixed(1)}h
          </Typography>
        </Box>
      )}
    </Box>
  )
}
