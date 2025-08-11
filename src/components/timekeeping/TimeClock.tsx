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
  Card,
  CardContent,
  Fade,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material'
import {
  PlayArrow as ClockInIcon,
  Stop as ClockOutIcon,
  Pause as BreakIcon,
  PlayArrow as ResumeIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
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
  const theme = useTheme()
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
    <Fade in={true} timeout={800}>
      <Box>
        {/* Header Section */}
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
                  mb: 2,
                }}
              >
                <TimeIcon />
              </Avatar>
            </Box>
            
            <Typography variant="h3" component="div" sx={{ 
              fontFamily: 'monospace', 
              mb: 2,
              fontWeight: 700,
              color: 'primary.main',
              textShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}>
              {formatTime(currentTime)}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              {formatDate(currentTime)}
            </Typography>
          </CardContent>
        </Card>

        {/* Status Display */}
        {stats && (
          <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip
                  label={stats.isCurrentlyClockedIn ? 'Clocked In' : 'Not Clocked In'}
                  color={stats.isCurrentlyClockedIn ? 'success' : 'default'}
                  variant={stats.isCurrentlyClockedIn ? 'filled' : 'outlined'}
                  icon={stats.isCurrentlyClockedIn ? <ClockInIcon /> : <ClockOutIcon />}
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1rem',
                    height: 40,
                    '& .MuiChip-label': { px: 2 }
                  }}
                />
                {stats.isOnBreak && (
                  <Chip
                    label="On Break"
                    color="warning"
                    variant="filled"
                    icon={<BreakIcon />}
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1rem',
                      height: 40,
                      '& .MuiChip-label': { px: 2 }
                    }}
                  />
                )}
              </Box>
              
              {stats.lastClockIn && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Last clock in: {new Date(stats.lastClockIn).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setError('')}>
                Dismiss
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Time Actions
            </Typography>
            
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
                  sx={{ 
                    height: 56,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Clock In'}
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
                        sx={{ 
                          height: 56,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          boxShadow: theme.shadows[4],
                          '&:hover': {
                            boxShadow: theme.shadows[8],
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Start Break'}
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<ClockOutIcon />}
                        onClick={handleClockOut}
                        disabled={loading}
                        fullWidth
                        sx={{ 
                          height: 56,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          boxShadow: theme.shadows[4],
                          '&:hover': {
                            boxShadow: theme.shadows[8],
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Clock Out'}
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
                      sx={{ 
                        height: 56,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: theme.shadows[4],
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'End Break'}
                    </Button>
                  )}
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {stats && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Box sx={{ 
              flex: 1,
              minWidth: 250,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main', mr: 1 }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  This Week
                </Typography>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                  {stats.currentWeekHours.toFixed(1)}h
                </Typography>
              </CardContent>
            </Box>
            
            <Box sx={{ 
              flex: 1,
              minWidth: 250,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 32, color: 'info.main', mr: 1 }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  This Month
                </Typography>
                <Typography variant="h3" color="info.main" sx={{ fontWeight: 700 }}>
                  {stats.currentMonthHours.toFixed(1)}h
                </Typography>
              </CardContent>
            </Box>
          </Box>
        )}
      </Box>
    </Fade>
  )
}
