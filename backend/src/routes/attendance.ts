import { Router } from 'express'
import {
  markAttendance,
  getMonthlyAttendance,
  getAttendanceStats,
  getAllUsersAttendance,
  getAttendanceByDate,
} from '../controllers/attendanceController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Mark attendance for a specific date
router.post('/', markAttendance)

// Get monthly attendance for current user
router.get('/monthly', getMonthlyAttendance)

// Get attendance stats for current user
router.get('/stats', getAttendanceStats)

// Get all users attendance for a month (admin only)
router.get('/all-users', getAllUsersAttendance)

// Get attendance by specific date (admin only)
router.get('/by-date/:date', getAttendanceByDate)

export { router as attendanceRoutes }
