export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'

export interface AttendanceRecord {
  id: string
  userId: string
  date: string
  status: AttendanceStatus
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
}

export interface MonthlyAttendance {
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

export interface AttendanceStats {
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
