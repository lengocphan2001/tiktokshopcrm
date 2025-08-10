import { PrismaClient } from '@prisma/client'
import { AttendanceStatus } from '@prisma/client'
import { prisma } from '../config/database'

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

export class AttendanceService {
  async markAttendance(userId: string, date: string, status: AttendanceStatus = 'PRESENT', notes?: string): Promise<AttendanceRecord> {
    const attendanceDate = new Date(date)
    
    // Check if attendance already exists for this date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: attendanceDate,
        },
      },
    })

    if (existingAttendance) {
      // Update existing attendance
      const updatedAttendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          notes,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      })

      return this.formatAttendanceResponse(updatedAttendance)
    } else {
      // Create new attendance
      const newAttendance = await prisma.attendance.create({
        data: {
          userId,
          date: attendanceDate,
          status,
          notes,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      })

      return this.formatAttendanceResponse(newAttendance)
    }
  }

  async getMonthlyAttendance(userId: string, year: number, month: number): Promise<MonthlyAttendance> {
    // Get today's date in Vietnam timezone first
    const today = new Date()
    const vietnamToday = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}))
    
    // Create dates using Vietnam timezone components
    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0)) // Last day of the month
    
    // Create today's date in UTC for comparison
    const todayVietnam = new Date(Date.UTC(
      vietnamToday.getFullYear(),
      vietnamToday.getMonth(),
      vietnamToday.getDate()
    ))
    
    // Get all attendance records for the month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        isActive: true,
      },
    })

    // Create a map of date to attendance status
    const attendanceMap = new Map<string, { status: AttendanceStatus; notes?: string }>()
    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0]
      attendanceMap.set(dateKey, { status: record.status, notes: record.notes || undefined })
    })

    // Generate all days of the month
    const days: Array<{
      date: string
      dayOfWeek: number
      isToday: boolean
      isPast: boolean
      isFuture: boolean
      status?: AttendanceStatus
      notes?: string
    }> = []

    for (let day = 1; day <= endDate.getDate(); day++) {
      // Create the current date in UTC using Vietnam timezone components
      const currentDate = new Date(Date.UTC(year, month - 1, day))
      const dateKey = currentDate.toISOString().split('T')[0]
      
      // Get day of week directly from UTC date
      const dayOfWeek = currentDate.getUTCDay()
      
      // Compare dates for today/past/future
      const isToday = dateKey === todayVietnam.toISOString().split('T')[0]
      const isPast = currentDate < todayVietnam
      const isFuture = currentDate > todayVietnam

      
      const attendance = attendanceMap.get(dateKey)
      
      days.push({
        date: dateKey,
        dayOfWeek,
        isToday,
        isPast,
        isFuture,
        status: attendance?.status,
        notes: attendance?.notes,
      })
    }

    return {
      year,
      month,
      days,
    }
  }

  async getAttendanceStats(userId: string): Promise<AttendanceStats> {
    const today = new Date()
    const vietnamToday = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}))
    const todayVietnam = new Date(vietnamToday.getFullYear(), vietnamToday.getMonth(), vietnamToday.getDate())
    const currentYear = vietnamToday.getFullYear()
    const currentMonth = vietnamToday.getMonth() + 1

    // Get all attendance records for the user
    const allAttendance = await prisma.attendance.findMany({
      where: {
        userId,
        isActive: true,
      },
    })

    // Calculate total stats
    const totalDays = allAttendance.length
    const presentDays = allAttendance.filter(a => a.status === 'PRESENT').length
    const absentDays = allAttendance.filter(a => a.status === 'ABSENT').length
    const lateDays = allAttendance.filter(a => a.status === 'LATE').length
    const halfDays = allAttendance.filter(a => a.status === 'HALF_DAY').length
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

    // Calculate current month stats
    const currentMonthAttendance = allAttendance.filter(a => {
      const attendanceDate = new Date(a.date)
      const attendanceDateVietnam = new Date(attendanceDate.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}))
      return attendanceDateVietnam.getFullYear() === currentYear && attendanceDateVietnam.getMonth() + 1 === currentMonth
    })

    const currentMonthTotalDays = currentMonthAttendance.length
    const currentMonthPresentDays = currentMonthAttendance.filter(a => a.status === 'PRESENT').length
    const currentMonthAbsentDays = currentMonthAttendance.filter(a => a.status === 'ABSENT').length
    const currentMonthLateDays = currentMonthAttendance.filter(a => a.status === 'LATE').length
    const currentMonthHalfDays = currentMonthAttendance.filter(a => a.status === 'HALF_DAY').length
    const currentMonthAttendanceRate = currentMonthTotalDays > 0 ? (currentMonthPresentDays / currentMonthTotalDays) * 100 : 0

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      halfDays,
      attendanceRate,
      currentMonthStats: {
        totalDays: currentMonthTotalDays,
        presentDays: currentMonthPresentDays,
        absentDays: currentMonthAbsentDays,
        lateDays: currentMonthLateDays,
        halfDays: currentMonthHalfDays,
        attendanceRate: currentMonthAttendanceRate,
      },
    }
  }

  async getAllUsersAttendance(year: number, month: number): Promise<Array<{
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      avatar?: string
    }
    attendance: MonthlyAttendance
    stats: AttendanceStats
  }>> {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    })

    const result = await Promise.all(
      users.map(async (user) => {
        const attendance = await this.getMonthlyAttendance(user.id, year, month)
        const stats = await this.getAttendanceStats(user.id)
        
        return {
          user,
          attendance,
          stats,
        }
      })
    )

    return result
  }

  async getAttendanceByDate(date: string): Promise<Array<AttendanceRecord>> {
    const attendanceDate = new Date(date)
    
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: attendanceDate,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    })

    return attendanceRecords.map(record => this.formatAttendanceResponse(record))
  }

  private formatAttendanceResponse(record: any): AttendanceRecord {
    return {
      id: record.id,
      userId: record.userId,
      date: record.date.toISOString().split('T')[0],
      status: record.status,
      notes: record.notes,
      isActive: record.isActive,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      user: record.user,
    }
  }
}
