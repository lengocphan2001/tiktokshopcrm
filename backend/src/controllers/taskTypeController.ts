import { Request, Response } from 'express'
import { TaskTypeService } from '../services/taskTypeService'
import { CreateTaskTypeInput, UpdateTaskTypeInput, TaskTypePaginationInput } from '../utils/validation'
import { AuthenticatedRequest } from '../middleware/auth'

export class TaskTypeController {
  private taskTypeService: TaskTypeService

  constructor() {
    this.taskTypeService = new TaskTypeService()
  }

  async createTaskType(req: AuthenticatedRequest, res: Response) {
    try {
      const data: CreateTaskTypeInput = req.body
      const createdBy = req.user!.id

      // Check if task type with this name already exists
      const existingTaskType = await this.taskTypeService.getTaskTypeByName(data.name)
      if (existingTaskType) {
        return res.status(400).json({
          success: false,
          message: 'Task type with this name already exists'
        })
      }

      const taskType = await this.taskTypeService.createTaskType(data, createdBy)

      return res.status(201).json({
        success: true,
        message: 'Task type created successfully',
        data: taskType
      })
    } catch (error) {
      console.error('Create task type error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async updateTaskType(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const data: UpdateTaskTypeInput = req.body
      const updatedBy = req.user!.id

      // Check if task type exists
      const existingTaskType = await this.taskTypeService.getTaskTypeById(id)
      if (!existingTaskType) {
        return res.status(404).json({
          success: false,
          message: 'Task type not found'
        })
      }

      // Check if name is being updated and if it already exists
      if (data.name && data.name !== existingTaskType.name) {
        const taskTypeWithName = await this.taskTypeService.getTaskTypeByName(data.name)
        if (taskTypeWithName && taskTypeWithName.id !== id) {
          return res.status(400).json({
            success: false,
            message: 'Task type with this name already exists'
          })
        }
      }

      const taskType = await this.taskTypeService.updateTaskType(id, data, updatedBy)

      return res.status(200).json({
        success: true,
        message: 'Task type updated successfully',
        data: taskType
      })
    } catch (error) {
      console.error('Update task type error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async deleteTaskType(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params

      // Check if task type exists
      const existingTaskType = await this.taskTypeService.getTaskTypeById(id)
      if (!existingTaskType) {
        return res.status(404).json({
          success: false,
          message: 'Task type not found'
        })
      }

      await this.taskTypeService.deleteTaskType(id)

      return res.status(200).json({
        success: true,
        message: 'Task type deleted successfully'
      })
    } catch (error) {
      console.error('Delete task type error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async getTaskTypeById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params

      const taskType = await this.taskTypeService.getTaskTypeById(id)
      if (!taskType) {
        return res.status(404).json({
          success: false,
          message: 'Task type not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: taskType
      })
    } catch (error) {
      console.error('Get task type error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async getTaskTypes(req: AuthenticatedRequest, res: Response) {
    try {
      const params: TaskTypePaginationInput = req.body as any

      const result = await this.taskTypeService.getTaskTypes(params)

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Get task types error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async deactivateTaskType(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const updatedBy = req.user!.id

      // Check if task type exists
      const existingTaskType = await this.taskTypeService.getTaskTypeById(id)
      if (!existingTaskType) {
        return res.status(404).json({
          success: false,
          message: 'Task type not found'
        })
      }

      const taskType = await this.taskTypeService.deactivateTaskType(id, updatedBy)

      return res.status(200).json({
        success: true,
        message: 'Task type deactivated successfully',
        data: taskType
      })
    } catch (error) {
      console.error('Deactivate task type error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async activateTaskType(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const updatedBy = req.user!.id

      // Check if task type exists
      const existingTaskType = await this.taskTypeService.getTaskTypeById(id)
      if (!existingTaskType) {
        return res.status(404).json({
          success: false,
          message: 'Task type not found'
        })
      }

      const taskType = await this.taskTypeService.activateTaskType(id, updatedBy)

      return res.status(200).json({
        success: true,
        message: 'Task type activated successfully',
        data: taskType
      })
    } catch (error) {
      console.error('Activate task type error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
} 