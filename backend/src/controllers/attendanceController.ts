import { Request, Response } from 'express'
import { AttendanceService } from '../services/attendanceService'
import { AttendanceStatus } from '@prisma/client'

const attendanceService = new AttendanceService()

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { date, status, notes } = req.body

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      })
    }

    // Validate status
    const validStatuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: PRESENT, ABSENT, LATE, HALF_DAY',
      })
    }

    const attendance = await attendanceService.markAttendance(
      userId,
      date,
      status || 'PRESENT',
      notes
    )

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark attendance',
    })
  }
}

export const getMonthlyAttendance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required',
      })
    }

    const attendance = await attendanceService.getMonthlyAttendance(
      userId,
      Number(year),
      Number(month)
    )

    res.json({
      success: true,
      message: 'Monthly attendance retrieved successfully',
      data: attendance,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve monthly attendance',
    })
  }
}

export const getAttendanceStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const stats = await attendanceService.getAttendanceStats(userId)

    res.json({
      success: true,
      message: 'Attendance stats retrieved successfully',
      data: stats,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve attendance stats',
    })
  }
}

export const getAllUsersAttendance = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const userRole = (req as any).user.role
    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
      })
    }

    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required',
      })
    }

    const attendance = await attendanceService.getAllUsersAttendance(
      Number(year),
      Number(month)
    )

    res.json({
      success: true,
      message: 'All users attendance retrieved successfully',
      data: attendance,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve all users attendance',
    })
  }
}

export const getAttendanceByDate = async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const userRole = (req as any).user.role
    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
      })
    }

    const { date } = req.params

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      })
    }

    const attendance = await attendanceService.getAttendanceByDate(date)

    res.json({
      success: true,
      message: 'Attendance by date retrieved successfully',
      data: attendance,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve attendance by date',
    })
  }
}
