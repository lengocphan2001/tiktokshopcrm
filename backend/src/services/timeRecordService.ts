import { PrismaClient } from '@prisma/client'
import { TimeRecord, CreateTimeRecordRequest, UpdateTimeRecordRequest, TimeRecordStats, PaginatedTimeRecordsResponse } from '../types/timeRecord'
import { CreateTimeRecordInput, UpdateTimeRecordInput, TimeRecordPaginationInput } from '../utils/validation'

const prisma = new PrismaClient()

export class TimeRecordService {
  async createTimeRecord(data: CreateTimeRecordInput, userId: string): Promise<TimeRecord> {
    const now = new Date()
    
    // Check if user is already clocked in for today
    if (data.status === 'CLOCKED_IN') {
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(now)
      todayEnd.setHours(23, 59, 59, 999)

      const existingRecord = await prisma.timeRecord.findFirst({
        where: {
          userId,
          status: 'CLOCKED_IN',
          clockInAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          isActive: true,
        },
      })

      if (existingRecord) {
        throw new Error('User is already clocked in for today')
      }
    }

    // Check if user is clocked in before allowing break or clock out
    if (data.status === 'CLOCKED_OUT' || data.status === 'BREAK_START') {
      const activeRecord = await prisma.timeRecord.findFirst({
        where: {
          userId,
          status: 'CLOCKED_IN',
          clockOutAt: null,
          isActive: true,
        },
        orderBy: {
          clockInAt: 'desc',
        },
      })

      if (!activeRecord) {
        throw new Error('User must be clocked in before clocking out or taking a break')
      }
    }

    // Handle break end
    if (data.status === 'BREAK_END') {
      const activeBreak = await prisma.timeRecord.findFirst({
        where: {
          userId,
          status: 'BREAK_START',
          breakEndAt: null,
          isActive: true,
        },
        orderBy: {
          breakStartAt: 'desc',
        },
      })

      if (!activeBreak) {
        throw new Error('No active break found to end')
      }

      // Update the break record
      const updatedRecord = await prisma.timeRecord.update({
        where: { id: activeBreak.id },
        data: {
          status: 'BREAK_END',
          breakEndAt: now,
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

      return this.formatTimeRecordResponse(updatedRecord)
    }

    // Create new time record
    const timeRecord = await prisma.timeRecord.create({
      data: {
        userId,
        status: data.status,
        clockInAt: data.status === 'CLOCKED_IN' ? now : null,
        clockOutAt: data.status === 'CLOCKED_OUT' ? now : null,
        breakStartAt: data.status === 'BREAK_START' ? now : null,
        notes: data.notes,
        location: data.location,
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

    return this.formatTimeRecordResponse(timeRecord)
  }

  async updateTimeRecord(id: string, data: UpdateTimeRecordInput, userId: string): Promise<TimeRecord> {
    const timeRecord = await prisma.timeRecord.findFirst({
      where: { id, userId },
    })

    if (!timeRecord) {
      throw new Error('Time record not found')
    }

    const updatedRecord = await prisma.timeRecord.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
        location: data.location,
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

    return this.formatTimeRecordResponse(updatedRecord)
  }

  async getTimeRecords(userId: string, pagination: TimeRecordPaginationInput): Promise<PaginatedTimeRecordsResponse> {
    const { page, limit, startDate, endDate, status } = pagination
    const skip = (page - 1) * limit

    const where: any = {
      userId,
      isActive: true,
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    if (status) {
      where.status = status
    }

    const [records, total] = await Promise.all([
      prisma.timeRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.timeRecord.count({ where }),
    ])

    return {
      data: records.map(record => this.formatTimeRecordResponse(record)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getTimeRecordStats(userId: string): Promise<TimeRecordStats> {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get current status
    const currentRecord = await prisma.timeRecord.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [
          { status: 'CLOCKED_IN', clockOutAt: null },
          { status: 'BREAK_START', breakEndAt: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get last clock in
    const lastClockIn = await prisma.timeRecord.findFirst({
      where: {
        userId,
        status: 'CLOCKED_IN',
        isActive: true,
      },
      orderBy: { clockInAt: 'desc' },
    })

    // Calculate total work hours
    const completedRecords = await prisma.timeRecord.findMany({
      where: {
        userId,
        status: 'CLOCKED_OUT',
        isActive: true,
        clockInAt: { not: null },
        clockOutAt: { not: null },
      },
    })

    let totalWorkHours = 0
    let totalWorkDays = completedRecords.length

    completedRecords.forEach(record => {
      if (record.clockInAt && record.clockOutAt && record.workHours) {
        totalWorkHours += Number(record.workHours)
      }
    })

    // Calculate current week hours
    const weekRecords = await prisma.timeRecord.findMany({
      where: {
        userId,
        status: 'CLOCKED_OUT',
        isActive: true,
        clockInAt: { gte: weekStart },
        clockOutAt: { not: null },
      },
    })

    let currentWeekHours = 0
    weekRecords.forEach(record => {
      if (record.workHours) {
        currentWeekHours += Number(record.workHours)
      }
    })

    // Calculate current month hours
    const monthRecords = await prisma.timeRecord.findMany({
      where: {
        userId,
        status: 'CLOCKED_OUT',
        isActive: true,
        clockInAt: { gte: monthStart },
        clockOutAt: { not: null },
      },
    })

    let currentMonthHours = 0
    monthRecords.forEach(record => {
      if (record.workHours) {
        currentMonthHours += Number(record.workHours)
      }
    })

    return {
      totalWorkDays,
      totalWorkHours,
      averageWorkHours: totalWorkDays > 0 ? totalWorkHours / totalWorkDays : 0,
      currentWeekHours,
      currentMonthHours,
      lastClockIn: lastClockIn?.clockInAt?.toISOString(),
      isCurrentlyClockedIn: currentRecord?.status === 'CLOCKED_IN',
      isOnBreak: currentRecord?.status === 'BREAK_START',
    }
  }

  async clockOut(userId: string): Promise<TimeRecord> {
    const activeRecord = await prisma.timeRecord.findFirst({
      where: {
        userId,
        status: 'CLOCKED_IN',
        clockOutAt: null,
        isActive: true,
      },
      orderBy: { clockInAt: 'desc' },
    })

    if (!activeRecord) {
      throw new Error('No active clock-in record found')
    }

    const now = new Date()
    const clockInTime = activeRecord.clockInAt!
    const totalHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)

    // Calculate break hours
    const breakRecords = await prisma.timeRecord.findMany({
      where: {
        userId,
        status: 'BREAK_END',
        breakStartAt: { gte: clockInTime },
        breakEndAt: { lte: now },
        isActive: true,
      },
    })

    let breakHours = 0
    breakRecords.forEach(record => {
      if (record.breakStartAt && record.breakEndAt) {
        breakHours += (record.breakEndAt.getTime() - record.breakStartAt.getTime()) / (1000 * 60 * 60)
      }
    })

    const workHours = totalHours - breakHours

    const updatedRecord = await prisma.timeRecord.update({
      where: { id: activeRecord.id },
      data: {
        status: 'CLOCKED_OUT',
        clockOutAt: now,
        totalHours,
        breakHours,
        workHours,
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

    return this.formatTimeRecordResponse(updatedRecord)
  }

  private formatTimeRecordResponse(record: any): TimeRecord {
    return {
      id: record.id,
      userId: record.userId,
      status: record.status,
      clockInAt: record.clockInAt?.toISOString(),
      clockOutAt: record.clockOutAt?.toISOString(),
      breakStartAt: record.breakStartAt?.toISOString(),
      breakEndAt: record.breakEndAt?.toISOString(),
      totalHours: record.totalHours ? Number(record.totalHours) : undefined,
      breakHours: record.breakHours ? Number(record.breakHours) : undefined,
      workHours: record.workHours ? Number(record.workHours) : undefined,
      notes: record.notes,
      location: record.location,
      isActive: record.isActive,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      user: record.user,
    }
  }
}
