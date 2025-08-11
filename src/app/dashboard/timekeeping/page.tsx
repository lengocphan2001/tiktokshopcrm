'use client';

import * as React from 'react'
import { Box, Container, Typography, Tabs, Tab, Card, CardContent, Fade, useTheme, alpha } from '@mui/material'
import { AttendanceCalendar } from '@/components/timekeeping/AttendanceCalendar'
import { AdminAttendanceOverview } from '@/components/timekeeping/AdminAttendanceOverview'
import { useUser } from '@/hooks/use-user'
import { 
  AccessTime as TimeIcon, 
  CalendarMonth as CalendarIcon, 
  AdminPanelSettings as AdminIcon,
  TrendingUp as StatsIcon 
} from '@mui/icons-material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function TimekeepingPage() {
  const theme = useTheme()
  const { user } = useUser()
  const [tabValue, setTabValue] = React.useState(0)

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading user...</p>
      </div>
    )
  }

  const isAdmin = user.role === 'ADMIN'

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Header */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 4, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                }}
              >
                <TimeIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  Timekeeping & Attendance
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Manage your work hours, track attendance, and monitor productivity
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        {/* Quick Stats Overview */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <TimeIcon sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                  Active
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently working
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ fontSize: 32, color: 'info.main' }} />
                </Box>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 700, mb: 1 }}>
                  Present
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <StatsIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                </Box>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                  40h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This week
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <AdminIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {isAdmin ? 'Admin' : 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access level
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Main Content Tabs */}
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="timekeeping tabs"
                sx={{
                  px: 3,
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                  },
                  '& .Mui-selected': {
                    color: 'primary.main',
                  },
                }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon />
                      My Attendance
                    </Box>
                  } 
                />
                {isAdmin && (
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminIcon />
                        Admin Overview
                      </Box>
                    } 
                  />
                )}
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <AttendanceCalendar userId={user.id} />
              </TabPanel>

              {isAdmin && (
                <TabPanel value={tabValue} index={1}>
                  <AdminAttendanceOverview isAdmin={isAdmin} />
                </TabPanel>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Fade>
  )
}
