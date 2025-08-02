import { prisma } from '../config/database'
import { hashPassword } from '../utils/auth'
import { CreateUserInput, UpdateUserInput, PaginationInput } from '../utils/validation'
import { UserResponse, PaginatedUsersResponse } from '../types/user'

export class UserService {
  async createUser(data: CreateUserInput, createdBy: string): Promise<UserResponse> {
    const hashedPassword = await hashPassword(data.password)
    
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        createdBy,
        updatedBy: createdBy,
      },
    })

    return this.formatUserResponse(user)
  }

  async updateUser(id: string, data: UpdateUserInput, updatedBy: string): Promise<UserResponse> {
    const updateData: any = { ...data, updatedBy }
    
    if (data.dateOfBirth) {
      updateData.dateOfBirth = new Date(data.dateOfBirth)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return this.formatUserResponse(user)
  }

  async deleteUser(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    return user ? this.formatUserResponse(user) : null
  }

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    return user ? this.formatUserResponse(user) : null
  }

  async getUsers(params: PaginationInput): Promise<PaginatedUsersResponse> {
    const { page, limit, search, role, status } = params
    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit), // Convert to number
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      users: users.map(user => this.formatUserResponse(user)),
      total,
      page,
      limit,
      totalPages,
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })
  }

  async deactivateUser(id: string, updatedBy: string): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data: { 
        isActive: false,
        updatedBy,
      },
    })

    return this.formatUserResponse(user)
  }

  async activateUser(id: string, updatedBy: string): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data: { 
        isActive: true,
        updatedBy,
      },
    })

    return this.formatUserResponse(user)
  }

  private formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      bankAccount: user.bankAccount,
      about: user.about,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
    }
  }
} 