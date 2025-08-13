import { prisma } from '../config/database'
import { CreateTaskInput, UpdateTaskInput, TaskPaginationInput } from '../utils/validation'
import { Task, PaginatedTasksResponse } from '../types/user'

export class TaskService {
  async createTask(data: CreateTaskInput, createdById: string): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        ...data,
        createdById,
        updatedBy: createdById,
      },
      include: {
        taskType: true,
        assignee: true,
        createdBy: true,
      },
    })

    return this.formatTaskResponse(task)
  }

  async updateTask(id: string, data: UpdateTaskInput, updatedById: string): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        updatedBy: updatedById,
      },
      include: {
        taskType: true,
        assignee: true,
        createdBy: true,
      },
    })

    return this.formatTaskResponse(task)
  }

  async deleteTask(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    })
  }

  async getTaskById(id: string): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        taskType: true,
        assignee: true,
        createdBy: true,
      },
    })

    return task ? this.formatTaskResponse(task) : null
  }

  async getTasks(params: TaskPaginationInput): Promise<PaginatedTasksResponse> {
    const { page = 1, limit = 10, search, status, taskTypeId, assigneeId, createdById } = params
    
    // Ensure page and limit are valid numbers
    const validPage = Math.max(1, Number(page) || 1)
    const validLimit = Math.max(1, Math.min(100, Number(limit) || 10))
    const skip = (validPage - 1) * validLimit

    const where: any = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (taskTypeId) {
      where.taskTypeId = taskTypeId
    }

    if (assigneeId) {
      where.assigneeId = assigneeId
    }

    if (createdById) {
      where.createdById = createdById
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: validLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          taskType: true,
          assignee: true,
          createdBy: true,
        },
      }),
      prisma.task.count({ where }),
    ])

    const totalPages = Math.ceil(total / validLimit)

    return {
      tasks: tasks.map((task: any) => this.formatTaskResponse(task)),
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
    }
  }

  async getTasksByAssignee(assigneeId: string, params: TaskPaginationInput): Promise<PaginatedTasksResponse> {
    const { page = 1, limit = 10, search, status } = params
    
    // Ensure page and limit are valid numbers
    const validPage = Math.max(1, Number(page) || 1)
    const validLimit = Math.max(1, Math.min(100, Number(limit) || 10))
    const skip = (validPage - 1) * validLimit

    const where: any = {
      assigneeId,
      isActive: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: validLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          taskType: true,
          assignee: true,
          createdBy: true,
        },
      }),
      prisma.task.count({ where }),
    ])

    const totalPages = Math.ceil(total / validLimit)

    return {
      tasks: tasks.map((task: any) => this.formatTaskResponse(task)),
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
    }
  }

  async updateTaskStatus(id: string, status: string, updatedById: string): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: status as any,
        updatedBy: updatedById,
      },
      include: {
        taskType: true,
        assignee: true,
        createdBy: true,
      },
    })

    return this.formatTaskResponse(task)
  }

  async updateTaskResult(id: string, result: string, updatedById: string): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: {
        result: result,
        updatedBy: updatedById,
      },
      include: {
        taskType: true,
        assignee: true,
        createdBy: true,
      },
    })

    return this.formatTaskResponse(task)
  }

  async deactivateTask(id: string, updatedById: string): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: { 
        isActive: false,
        updatedBy: updatedById,
      },
      include: {
        taskType: true,
        assignee: true,
        createdBy: true,
      },
    })

    return this.formatTaskResponse(task)
  }

  async activateTask(id: string, updatedById: string): Promise<Task> {
    const task = await prisma.task.update({
      where: { id },
      data: { 
        isActive: true,
        updatedBy: updatedById,
      },
      include: {
        taskType: true,
        assignee: true,
        createdBy: true,
      },
    })

    return this.formatTaskResponse(task)
  }

  private formatTaskResponse(task: any): Task {
    return {
      id: task.id,
      name: task.name,
      description: task.description,
      startDate: task.startDate.toISOString(),
      endDate: task.endDate.toISOString(),
      resource: task.resource,
      result: task.result,
      status: task.status,
      isActive: task.isActive,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      taskTypeId: task.taskTypeId,
      taskType: {
        id: task.taskType.id,
        name: task.taskType.name,
        price: Number(task.taskType.price),
        isActive: task.taskType.isActive,
        createdAt: task.taskType.createdAt.toISOString(),
        updatedAt: task.taskType.updatedAt.toISOString(),
        createdBy: task.taskType.createdBy,
        updatedBy: task.taskType.updatedBy,
      },
      assigneeId: task.assigneeId,
      assignee: {
        id: task.assignee.id,
        firstName: task.assignee.firstName,
        lastName: task.assignee.lastName,
        email: task.assignee.email,
        phone: task.assignee.phone,
        avatar: task.assignee.avatar,
        bankAccount: task.assignee.bankAccount,
        about: task.assignee.about,
        address: task.assignee.address,
        dateOfBirth: task.assignee.dateOfBirth?.toISOString(),
        role: task.assignee.role,
        status: task.assignee.status,
        isActive: task.assignee.isActive,
        lastLoginAt: task.assignee.lastLoginAt?.toISOString(),
        createdAt: task.assignee.createdAt.toISOString(),
        updatedAt: task.assignee.updatedAt.toISOString(),
        createdBy: task.assignee.createdBy,
        updatedBy: task.assignee.updatedBy,
      },
      createdById: task.createdById,
      createdBy: {
        id: task.createdBy.id,
        firstName: task.createdBy.firstName,
        lastName: task.createdBy.lastName,
        email: task.createdBy.email,
        phone: task.createdBy.phone,
        avatar: task.createdBy.avatar,
        bankAccount: task.createdBy.bankAccount,
        about: task.createdBy.about,
        address: task.createdBy.address,
        dateOfBirth: task.createdBy.dateOfBirth?.toISOString(),
        role: task.createdBy.role,
        status: task.createdBy.status,
        isActive: task.createdBy.isActive,
        lastLoginAt: task.createdBy.lastLoginAt?.toISOString(),
        createdAt: task.createdBy.createdAt.toISOString(),
        updatedAt: task.createdBy.updatedAt.toISOString(),
        createdBy: task.createdBy.createdBy,
        updatedBy: task.createdBy.updatedBy,
      },
      updatedBy: task.updatedBy,
    }
  }
} 