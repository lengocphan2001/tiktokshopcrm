'use client';

import * as React from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Fade,
  useTheme,
  alpha,
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { AttendanceStatus } from '@/types/attendance'

interface AttendanceCalendarProps {
  userId: string
  isAdmin?: boolean
}

interface DayData {
  date: string
  dayOfWeek: number
  isToday: boolean
  isPast: boolean
  isFuture: boolean
  status?: AttendanceStatus
  notes?: string
}

interface MonthlyAttendance {
  year: number
  month: number
  days: DayData[]
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ userId, isAdmin = false }) => {
  const theme = useTheme()
  
  // Helper function to get Vietnam timezone date
  const getVietnamDate = () => {
    const now = new Date()
    // Get the current date in Vietnam timezone
    const vietnamDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}))
    // Create a new date object in UTC with Vietnam timezone components
    return new Date(Date.UTC(
      vietnamDate.getFullYear(),
      vietnamDate.getMonth(),
      vietnamDate.getDate()
    ))
  }
  
  // Helper function to check if a date is today in Vietnam timezone
  const isTodayInVietnam = (dateString: string) => {
    const vietnamNow = getVietnamDate()
    return new Date(dateString).toISOString().split('T')[0] === vietnamNow.toISOString().split('T')[0]
  }
  const [currentDate, setCurrentDate] = React.useState(() => {
    // Use Vietnam timezone for consistency with backend
    const vietnamNow = getVietnamDate()
    console.log('Initializing calendar with Vietnam date:', vietnamNow.toISOString(), 'Month:', vietnamNow.getMonth() + 1)
    return vietnamNow
  })
  const [attendance, setAttendance] = React.useState<MonthlyAttendance | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string>('')
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editStatus, setEditStatus] = React.useState<AttendanceStatus>('PRESENT')
  const [editNotes, setEditNotes] = React.useState('')

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  
  // Debug logging
  const vietnamNow = getVietnamDate()
  console.log('Current Vietnam Date:', vietnamNow.toLocaleDateString('en-GB'))
  console.log('Calendar State - Year:', currentYear, 'Month:', currentMonth)
  console.log('Calendar State - Date:', currentDate.toLocaleDateString('en-GB'))
  console.log('Day of Week (Vietnam):', vietnamNow.getUTCDay(), '(0 = Sunday, 1 = Monday, etc.)')

  // Fetch attendance data
  const fetchAttendance = React.useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/attendance/monthly?year=${currentYear}&month=${currentMonth}`,
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
       console.log('Attendance data received:', data.data)
       console.log('Today from frontend:', new Date().toISOString().split('T')[0])
       console.log('Today day in data:', data.data?.days.find((day: DayData) => day.isToday))
       setAttendance(data.data)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }, [currentYear, currentMonth])

  // Mark attendance
  const markAttendance = async (date: string, status: AttendanceStatus, notes?: string) => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/attendance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            date,
            status,
            notes,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to mark attendance')
      }

      // Refresh attendance data
      await fetchAttendance()
      setEditDialogOpen(false)
      setSelectedDate(null)
    } catch (error: any) {
      setError(error.message || 'Failed to mark attendance')
    } finally {
      setLoading(false)
    }
  }

  // Handle date click
  const handleDateClick = (day: DayData) => {
    console.log('Date clicked:', day)
    console.log('isFuture:', day.isFuture, 'isToday:', day.isToday, 'isPast:', day.isPast)
    
    // Show modal for past days and today, but prevent future day editing
    if (day.isFuture) {
      console.log('Future day clicked, ignoring')
      return
    }

    console.log('Opening dialog for date:', day.date)
    setSelectedDate(day.date)
    setEditStatus(day.status || 'PRESENT')
    setEditNotes(day.notes || '')
    setEditDialogOpen(true)
  }

  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(Date.UTC(prev.getFullYear(), prev.getMonth() - 1, 1)))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(Date.UTC(prev.getFullYear(), prev.getMonth() + 1, 1)))
  }

  const handleGoToToday = () => {
    // Use Vietnam timezone for consistency
    setCurrentDate(getVietnamDate())
  }

  // Ensure calendar starts with current month
  React.useEffect(() => {
    // Use Vietnam timezone for consistency
    const vietnamNow = getVietnamDate()
    const currentMonth = vietnamNow.getMonth()
    const currentYear = vietnamNow.getFullYear()
    
    console.log('Checking calendar alignment...')
    console.log('Vietnam Now:', vietnamNow.toLocaleDateString('en-GB'))
    console.log('Calendar State:', currentDate.toLocaleDateString('en-GB'))
    console.log('Should reset:', currentDate.getMonth() !== currentMonth || currentDate.getFullYear() !== currentYear)
    
    if (currentDate.getMonth() !== currentMonth || currentDate.getFullYear() !== currentYear) {
      console.log('Resetting calendar to current Vietnam month:', currentMonth + 1, currentYear)
      setCurrentDate(vietnamNow)
    }
  }, [currentDate])

  // Load attendance data when month changes
  React.useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const renderDayCell = (day: DayData) => {
    const isClickable = day.isPast || day.isToday // Allow clicking on past days and today to view details
    const hasAttendance = day.status && day.status !== 'ABSENT'
    
    return (
      <Card
        key={day.date}
        elevation={day.isToday ? 8 : 1}
        sx={{
          minHeight: 80,
          cursor: isClickable ? 'pointer' : 'default',
          backgroundColor: day.isToday 
            ? alpha(theme.palette.primary.main, 0.1)
            : day.isPast && !day.isToday
            ? alpha(theme.palette.action.hover, 0.05)
            : theme.palette.background.paper,
          border: day.isToday 
            ? `2px solid ${theme.palette.primary.main}`
            : day.isPast && !day.isToday
            ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
            : `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          position: 'relative',
          overflow: 'visible',
          '&:hover': isClickable ? {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
            backgroundColor: alpha(theme.palette.action.hover, 0.1),
          } : {},
        }}
        onClick={() => handleDateClick(day)}
      >
        <CardContent sx={{ p: 1.5, textAlign: 'center', position: 'relative' }}>
          {/* Date Number */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              mb: 1,
              fontWeight: day.isToday ? 700 : 500,
              color: day.isToday ? 'primary.main' : 'text.primary',
            }}
          >
            {new Date(day.date).getDate()}
          </Typography>
          
          {/* Status Chip */}
          {day.status && (
            <Chip
              label={STATUS_LABELS[day.status]}
              color={STATUS_COLORS[day.status]}
              size="small"
              variant="filled"
              onClick={(e) => e.stopPropagation()}
              sx={{ 
                fontSize: '0.65rem', 
                height: 22,
                fontWeight: 600,
                '& .MuiChip-label': {
                  px: 1,
                }
              }}
            />
          )}
          
          {/* Notes Indicator */}
          {day.notes && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'secondary.main',
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[2],
              }}
            />
          )}
          
          {/* Edit Indicator for Past Days */}
          {day.isPast && !day.isToday && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.6),
                border: `1px solid ${theme.palette.background.paper}`,
              }}
            />
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading && !attendance) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight={400}
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          Loading attendance data...
        </Typography>
      </Box>
    )
  }

  return (
    <Fade in={true} timeout={800}>
      <Box>
        {/* Header Section */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 4, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {MONTHS[currentMonth - 1]} {currentYear}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track your daily attendance and work patterns
                  </Typography>
                                     <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                     Current: {getVietnamDate().toLocaleDateString('en-GB')} | Displaying: {currentYear}-{currentMonth.toString().padStart(2, '0')} | State: {currentDate.toLocaleDateString('en-GB')}
                   </Typography>
                </Box>
              </Box>
              
                             <Box sx={{ display: 'flex', gap: 1 }}>
                 <IconButton 
                   onClick={handlePreviousMonth} 
                   disabled={loading}
                   sx={{ 
                     backgroundColor: alpha(theme.palette.primary.main, 0.1),
                     '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                   }}
                 >
                   <ChevronLeftIcon />
                 </IconButton>
                 <Button
                   variant="outlined"
                   onClick={handleGoToToday}
                   disabled={loading}
                   startIcon={<TodayIcon />}
                   sx={{ 
                     backgroundColor: alpha(theme.palette.primary.main, 0.1),
                     '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                   }}
                 >
                   Today
                 </Button>
                 <IconButton 
                   onClick={handleNextMonth} 
                   disabled={loading}
                   sx={{ 
                     backgroundColor: alpha(theme.palette.primary.main, 0.1),
                     '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                   }}
                 >
                   <ChevronRightIcon />
                 </IconButton>
               </Box>
            </Box>
          </CardContent>
        </Card>

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

        {/* Calendar Grid */}
        <Card elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: 3 }}>
            {/* Day headers */}
            <Box
              sx={{
                mb: 2,
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                columnGap: 8,
              }}
            >
              {DAYS_OF_WEEK.map(day => (
                <Box key={day}>
                  <Box sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    fontWeight: 700,
                    color: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 1,
                    mb: 1,
                  }}>
                    {day}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Calendar days */}
            {attendance && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 8,
                }}
              >
                {/* Leading empty cells for alignment */}
                {attendance.days.length > 0 && (() => {
                  const firstDayOfWeek = attendance.days[0].dayOfWeek
                  console.log('First day of month falls on:', firstDayOfWeek, '(0 = Sunday)')
                  return [...Array(firstDayOfWeek)].map((_, idx) => (
                    <Box key={`start-offset-${idx}`} />
                  ))
                })()}

                {attendance.days.map(day => {
                  console.log('Rendering day:', day.date, 'Day of week:', day.dayOfWeek)
                  return (
                    <Box key={day.date}>
                      {renderDayCell(day)}
                    </Box>
                  )
                })}

                {/* Trailing empty cells to complete the grid */}
                {attendance.days.length > 0 && (() => {
                  const lastDayOfWeek = attendance.days[attendance.days.length - 1].dayOfWeek
                  console.log('Last day of month falls on:', lastDayOfWeek, '(0 = Sunday)')
                  return [...Array(6 - lastDayOfWeek)].map((_, idx) => (
                    <Box key={`end-offset-${idx}`} />
                  ))
                })()}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Legend and Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 24,
          }}
        >
          <Box>
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Status Legend
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={label}
                        color={STATUS_COLORS[status as AttendanceStatus]}
                        size="small"
                        variant="outlined"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: 'secondary.main',
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">Has notes</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card elevation={0} sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                     <Button
                     variant="outlined"
                     startIcon={<TodayIcon />}
                                           onClick={() => {
                        // Find today's day in the attendance data using Vietnam timezone
                        const vietnamNow = getVietnamDate()
                        const today = vietnamNow.toISOString().split('T')[0]
                        const todayDay = attendance?.days.find(day => day.date === today)
                        if (todayDay) {
                          handleDateClick(todayDay)
                        } else {
                          // Fallback if today's data is not available
                          handleDateClick({
                            date: today,
                            dayOfWeek: vietnamNow.getDay(),
                            isToday: true,
                            isPast: false,
                            isFuture: false,
                          })
                        }
                      }}
                     fullWidth
                   >
                     Mark Today
                   </Button>
                                     <Button
                     variant="outlined"
                     startIcon={<ScheduleIcon />}
                     onClick={() => {
                       const vietnamNow = getVietnamDate()
                       handleDateClick({
                         date: vietnamNow.toISOString().split('T')[0],
                         dayOfWeek: vietnamNow.getDay(),
                         isToday: true,
                         isPast: false,
                         isFuture: false,
                       })
                     }}
                     fullWidth
                   >
                     View History
                   </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

                 {/* Attendance Dialog */}
         <Dialog 
           open={editDialogOpen} 
           onClose={() => setEditDialogOpen(false)} 
           maxWidth="sm" 
           fullWidth
           PaperProps={{
             sx: { borderRadius: 3 }
           }}
         >
                       <DialogTitle sx={{ 
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
                            {selectedDate && isTodayInVietnam(selectedDate) ? (
                 <>
                   <EditIcon color="primary" />
                   Mark Attendance - {selectedDate && new Date(selectedDate).toLocaleDateString('en-GB')}
                 </>
               ) : (
                 <>
                   <ScheduleIcon color="primary" />
                   Attendance Details - {selectedDate && new Date(selectedDate).toLocaleDateString('en-GB')}
                 </>
               )}
            </DialogTitle>
                     <DialogContent>
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
               {selectedDate && isTodayInVietnam(selectedDate) ? (
                 // Today - Editable form
                 <>
                   <FormControl fullWidth>
                     <InputLabel>Status</InputLabel>
                     <Select
                       value={editStatus}
                       onChange={(e) => setEditStatus(e.target.value as AttendanceStatus)}
                       label="Status"
                       sx={{ borderRadius: 2 }}
                     >
                       <MenuItem value="PRESENT">Present</MenuItem>
                       <MenuItem value="ABSENT">Absent</MenuItem>
                       <MenuItem value="LATE">Late</MenuItem>
                       <MenuItem value="HALF_DAY">Half Day</MenuItem>
                     </Select>
                   </FormControl>
                   
                   <TextField
                     label="Notes (optional)"
                     multiline
                     rows={3}
                     value={editNotes}
                     onChange={(e) => setEditNotes(e.target.value)}
                     fullWidth
                     sx={{ borderRadius: 2 }}
                     placeholder="Add any notes about your attendance..."
                   />
                 </>
               ) : (
                 // Past day - Read-only display
                 <>
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     <Typography variant="subtitle2" color="text.secondary">
                       Status
                     </Typography>
                     <Chip
                       label={STATUS_LABELS[editStatus]}
                       color={STATUS_COLORS[editStatus]}
                       size="medium"
                       variant="filled"
                       sx={{ alignSelf: 'flex-start' }}
                     />
                   </Box>
                   
                   {editNotes && (
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                       <Typography variant="subtitle2" color="text.secondary">
                         Notes
                       </Typography>
                       <Box
                         sx={{
                           p: 2,
                           border: `1px solid ${theme.palette.divider}`,
                           borderRadius: 2,
                           backgroundColor: theme.palette.background.default,
                           minHeight: 60,
                         }}
                       >
                         <Typography variant="body2">
                           {editNotes}
                         </Typography>
                       </Box>
                     </Box>
                   )}
                   
                   {!editNotes && (
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                       <Typography variant="subtitle2" color="text.secondary">
                         Notes
                       </Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                         No notes added for this day.
                       </Typography>
                     </Box>
                   )}
                 </>
               )}
             </Box>
           </DialogContent>
                     <DialogActions sx={{ p: 3, pt: 1 }}>
             {selectedDate && isTodayInVietnam(selectedDate) ? (
               // Today - Show Save and Cancel buttons
               <>
                 <Button 
                   onClick={() => setEditDialogOpen(false)}
                   variant="outlined"
                   sx={{ borderRadius: 2 }}
                 >
                   Cancel
                 </Button>
                 <Button
                   onClick={() => markAttendance(selectedDate!, editStatus, editNotes)}
                   variant="contained"
                   disabled={loading}
                   startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                   sx={{ borderRadius: 2 }}
                 >
                   {loading ? 'Saving...' : 'Save Attendance'}
                 </Button>
               </>
             ) : (
               // Past day - Show only Close button
               <Button 
                 onClick={() => setEditDialogOpen(false)}
                 variant="contained"
                 sx={{ borderRadius: 2 }}
               >
                 Close
               </Button>
             )}
           </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  )
}
