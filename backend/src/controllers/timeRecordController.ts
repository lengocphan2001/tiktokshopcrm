import { Request, Response } from 'express'
import { TimeRecordService } from '../services/timeRecordService'
import { CreateTimeRecordInput, UpdateTimeRecordInput, TimeRecordPaginationInput } from '../utils/validation'

const timeRecordService = new TimeRecordService()

export const createTimeRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data: CreateTimeRecordInput = req.body

    const timeRecord = await timeRecordService.createTimeRecord(data, userId)

    res.status(201).json({
      success: true,
      message: 'Time record created successfully',
      data: timeRecord,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create time record',
    })
  }
}

export const updateTimeRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    const data: UpdateTimeRecordInput = req.body

    const timeRecord = await timeRecordService.updateTimeRecord(id, data, userId)

    res.json({
      success: true,
      message: 'Time record updated successfully',
      data: timeRecord,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update time record',
    })
  }
}

export const getTimeRecords = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const pagination: TimeRecordPaginationInput = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      status: req.query.status as any,
    }

    const result = await timeRecordService.getTimeRecords(userId, pagination)

    res.json({
      success: true,
      message: 'Time records retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve time records',
    })
  }
}

export const getTimeRecordStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const stats = await timeRecordService.getTimeRecordStats(userId)

    res.json({
      success: true,
      message: 'Time record stats retrieved successfully',
      data: stats,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve time record stats',
    })
  }
}

export const clockOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const timeRecord = await timeRecordService.clockOut(userId)

    res.json({
      success: true,
      message: 'Clocked out successfully',
      data: timeRecord,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to clock out',
    })
  }
}
