'use client';

import React from 'react'
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
  Divider,
  Fade,
  useTheme,
  alpha,
  Avatar,
  LinearProgress
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

interface TimeStatsProps {
  userId: string
}

interface StatsData {
  totalHours: number
  averageHoursPerDay: number
  daysWorked: number
  totalDays: number
  currentStreak: number
  longestStreak: number
  weeklyHours: number[]
  monthlyHours: number[]
}

export const TimeStats: React.FC<TimeStatsProps> = ({ userId }) => {
  const theme = useTheme()
  const [stats, setStats] = React.useState<StatsData | null>(null)
  const [loading, setLoading] = React.useState(false)
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

  // Load stats on mount
  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Mock data for demonstration
  const mockStats: StatsData = {
    totalHours: 168.5,
    averageHoursPerDay: 8.4,
    daysWorked: 20,
    totalDays: 22,
    currentStreak: 5,
    longestStreak: 12,
    weeklyHours: [40, 38, 42, 35, 39],
    monthlyHours: [168, 172, 165, 180],
  }

  const statsData = stats || mockStats

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'success'
    if (percentage >= 60) return 'warning'
    return 'error'
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 10) return 'success'
    if (streak >= 5) return 'warning'
    return 'info'
  }

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
                <TrendingUpIcon />
              </Avatar>
            </Box>
            
            <Typography variant="h4" component="div" sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: 'primary.main',
            }}>
              Time Statistics
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              Track your productivity and work patterns
            </Typography>
          </CardContent>
        </Card>

        {/* Main Stats Grid */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
              height: '100%',
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <TimeIcon sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {statsData.totalHours.toFixed(1)}h
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Hours
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
              height: '100%',
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 32, color: 'info.main' }} />
                </Box>
                <Typography variant="h3" color="info.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {statsData.averageHoursPerDay.toFixed(1)}h
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Daily Average
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
              height: '100%',
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                </Box>
                <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {statsData.currentStreak}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Current Streak
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              height: '100%',
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CheckIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {statsData.longestStreak}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Best Streak
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Detailed Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Attendance Progress */}
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color="success" />
                  Attendance Progress
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Days Worked
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {statsData.daysWorked}/{statsData.totalDays}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(statsData.daysWorked / statsData.totalDays) * 100}
                    color={getProgressColor((statsData.daysWorked / statsData.totalDays) * 100) as any}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${Math.round((statsData.daysWorked / statsData.totalDays) * 100)}% Present`}
                    color={getProgressColor((statsData.daysWorked / statsData.totalDays) * 100) as any}
                    variant="filled"
                    icon={<CheckIcon />}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={`${statsData.currentStreak} Day Streak`}
                    color={getStreakColor(statsData.currentStreak) as any}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Weekly Overview */}
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="info" />
                  Weekly Overview
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {statsData.weeklyHours.map((hours, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60, fontWeight: 500 }}>
                        Week {index + 1}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(hours / 40) * 100}
                          color={getProgressColor((hours / 40) * 100) as any}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 40 }}>
                        {hours}h
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Target: 40 hours per week
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Performance Insights */}
        <Card elevation={0} sx={{ mt: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" />
              Performance Insights
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                  <CheckIcon color="success" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Consistent Performance
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      You're meeting your daily targets
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.warning.main, 0.05) }}>
                  <WarningIcon color="warning" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Room for Improvement
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Consider increasing weekly hours
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                  <TrendingUpIcon color="info" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Strong Streak
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Keep up the good work!
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
