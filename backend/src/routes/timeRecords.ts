import { Router } from 'express'
import {
  createTimeRecord,
  updateTimeRecord,
  getTimeRecords,
  getTimeRecordStats,
  clockOut,
} from '../controllers/timeRecordController'
import { authenticateToken } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { createTimeRecordSchema, updateTimeRecordSchema, timeRecordPaginationSchema } from '../utils/validation'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Create time record (clock in, break start, etc.)
router.post('/', validateRequest(createTimeRecordSchema), createTimeRecord)

// Update time record
router.put('/:id', validateRequest(updateTimeRecordSchema), updateTimeRecord)

// Get time records with pagination and filtering
router.get('/', validateRequest(timeRecordPaginationSchema), getTimeRecords)

// Get time record statistics
router.get('/stats', getTimeRecordStats)

// Clock out (special endpoint for ending work day)
router.post('/clock-out', clockOut)

export { router as timeRecordRoutes }
