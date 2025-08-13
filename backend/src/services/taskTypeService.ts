import { prisma } from '../config/database'
import { CreateTaskTypeInput, UpdateTaskTypeInput, TaskTypePaginationInput } from '../utils/validation'
import { TaskTypeResponse, PaginatedTaskTypesResponse } from '../types/user'

export class TaskTypeService {
  async createTaskType(data: CreateTaskTypeInput, createdBy: string): Promise<TaskTypeResponse> {
    const taskType = await prisma.taskType.create({
      data: {
        ...data,
        createdBy,
        updatedBy: createdBy,
      },
    })

    return this.formatTaskTypeResponse(taskType)
  }

  async updateTaskType(id: string, data: UpdateTaskTypeInput, updatedBy: string): Promise<TaskTypeResponse> {
    const taskType = await prisma.taskType.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
      },
    })

    return this.formatTaskTypeResponse(taskType)
  }

  async deleteTaskType(id: string): Promise<void> {
    await prisma.taskType.delete({
      where: { id },
    })
  }

  async getTaskTypeById(id: string): Promise<TaskTypeResponse | null> {
    const taskType = await prisma.taskType.findUnique({
      where: { id },
    })

    return taskType ? this.formatTaskTypeResponse(taskType) : null
  }

  async getTaskTypeByName(name: string): Promise<TaskTypeResponse | null> {
    const taskType = await prisma.taskType.findUnique({
      where: { name },
    })

    return taskType ? this.formatTaskTypeResponse(taskType) : null
  }

  async getTaskTypes(params: TaskTypePaginationInput): Promise<PaginatedTaskTypesResponse> {
    const { page, limit, search } = params
    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (search) {
      where.name = { contains: search }
    }

    const [taskTypes, total] = await Promise.all([
      prisma.taskType.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.taskType.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      taskTypes: taskTypes.map((taskType: any) => this.formatTaskTypeResponse(taskType)),
      total,
      page,
      limit,
      totalPages,
    }
  }

  async deactivateTaskType(id: string, updatedBy: string): Promise<TaskTypeResponse> {
    const taskType = await prisma.taskType.update({
      where: { id },
      data: { 
        isActive: false,
        updatedBy,
      },
    })

    return this.formatTaskTypeResponse(taskType)
  }

  async activateTaskType(id: string, updatedBy: string): Promise<TaskTypeResponse> {
    const taskType = await prisma.taskType.update({
      where: { id },
      data: { 
        isActive: true,
        updatedBy,
      },
    })

    return this.formatTaskTypeResponse(taskType)
  }

  private formatTaskTypeResponse(taskType: any): TaskTypeResponse {
    return {
      id: taskType.id,
      name: taskType.name,
      price: Number(taskType.price),
      isActive: taskType.isActive,
      createdAt: taskType.createdAt.toISOString(),
      updatedAt: taskType.updatedAt.toISOString(),
      createdBy: taskType.createdBy,
      updatedBy: taskType.updatedBy,
    }
  }
} 