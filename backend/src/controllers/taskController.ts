import { Request, Response } from 'express'
import { TaskService } from '../services/taskService'
import { CreateTaskInput, UpdateTaskInput, TaskPaginationInput } from '../utils/validation'
import { globalNotificationHelper } from '../services/globalNotificationHelper'

export class TaskController {
  private taskService: TaskService

  constructor() {
    this.taskService = new TaskService()
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateTaskInput
      const createdById = req.user!.id

      const task = await this.taskService.createTask(data, createdById)

      // Send notification to the assignee (this won't break if WebSocket is not available)
      try {
        await globalNotificationHelper.sendTaskCreatedNotification(task, req.user!)
      } catch (notificationError) {
        console.error('Notification error (non-blocking):', notificationError)
      }

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      })
    } catch (error: any) {
      console.error('Create task error:', error)
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to create task',
        })
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to create task',
        })
      }
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const data = req.body as UpdateTaskInput
      const updatedById = req.user!.id

      // Get the previous task data for comparison
      const previousTask = await this.taskService.getTaskById(id)
      if (!previousTask) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        })
        return
      }

      const task = await this.taskService.updateTask(id, data, updatedById)

      // Send notification about the update
      try {
        await globalNotificationHelper.sendTaskUpdatedNotification(task, req.user!, previousTask)
      } catch (notificationError) {
        console.error('Notification error (non-blocking):', notificationError)
      }

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      })
    } catch (error: any) {
      console.error('Update task error:', error)
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to update task',
        })
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to update task',
        })
      }
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      await this.taskService.deleteTask(id)

      res.json({
        success: true,
        message: 'Task deleted successfully',
      })
    } catch (error: any) {
      console.error('Delete task error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete task',
      })
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const task = await this.taskService.getTaskById(id)

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        })
        return
      }

      res.json({
        success: true,
        data: task,
      })
    } catch (error: any) {
      console.error('Get task by ID error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get task',
      })
    }
  }

  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search, status, taskTypeId, assigneeId, createdById } = req.query
      
      const params: TaskPaginationInput = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search: search as string,
        status: status as string,
        taskTypeId: taskTypeId as string,
        assigneeId: assigneeId as string,
        createdById: createdById as string,
      }

      const tasks = await this.taskService.getTasks(params)

      res.json({
        success: true,
        data: tasks,
      })
    } catch (error: any) {
      console.error('Get tasks error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get tasks',
      })
    }
  }

  async getTasksByAssignee(req: Request, res: Response): Promise<void> {
    try {
      const { assigneeId } = req.params
      const bodyParams = req.body as any
      
      const params: TaskPaginationInput = {
        page: Number(bodyParams.page) || 1,
        limit: Number(bodyParams.limit) || 10,
        search: bodyParams.search,
        status: bodyParams.status,
        taskTypeId: bodyParams.taskTypeId,
        assigneeId: bodyParams.assigneeId,
        createdById: bodyParams.createdById,
      }

      const tasks = await this.taskService.getTasksByAssignee(assigneeId, params)

      res.json({
        success: true,
        data: tasks,
      })
    } catch (error: any) {
      console.error('Get tasks by assignee error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get tasks by assignee',
      })
    }
  }

  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { status } = req.body
      const updatedById = req.user!.id

      // Get the previous task data for status comparison
      const previousTask = await this.taskService.getTaskById(id)
      if (!previousTask) {
        res.status(404).json({
          success: false,
          message: 'Task not found',
        })
        return
      }

      const task = await this.taskService.updateTaskStatus(id, status, updatedById)

      // Send notification about the status change
      try {
        await globalNotificationHelper.sendTaskStatusChangedNotification(task, req.user!, previousTask.status)
      } catch (notificationError) {
        console.error('Notification error (non-blocking):', notificationError)
      }

      res.json({
        success: true,
        message: 'Task status updated successfully',
        data: task,
      })
    } catch (error: any) {
      console.error('Update task status error:', error)
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to update task status',
        })
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to update task status',
        })
      }
    }
  }

  async updateTaskResult(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { result } = req.body
      const updatedById = req.user!.id

      const task = await this.taskService.updateTaskResult(id, result, updatedById)

      // Send notification about the result update
      try {
        await globalNotificationHelper.sendTaskResultUpdatedNotification(task, req.user!)
      } catch (notificationError) {
        console.error('Notification error (non-blocking):', notificationError)
      }

      res.json({
        success: true,
        message: 'Task result updated successfully',
        data: task,
      })
    } catch (error: any) {
      console.error('Update task result error:', error)
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to update task result',
        })
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to update task result',
        })
      }
    }
  }

  async deactivateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updatedById = req.user!.id

      const task = await this.taskService.deactivateTask(id, updatedById)

      res.json({
        success: true,
        message: 'Task deactivated successfully',
        data: task,
      })
    } catch (error: any) {
      console.error('Deactivate task error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to deactivate task',
      })
    }
  }

  async activateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updatedById = req.user!.id

      const task = await this.taskService.activateTask(id, updatedById)

      res.json({
        success: true,
        message: 'Task activated successfully',
        data: task,
      })
    } catch (error: any) {
      console.error('Activate task error:', error)
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to activate task',
      })
    }
  }
} 