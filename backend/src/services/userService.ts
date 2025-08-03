import { PrismaClient } from '@prisma/client'
import { User, CreateUserRequest, UpdateUserRequest, PaginatedUsersResponse } from '../types/user'
import { CreateUserInput, UpdateUserInput, PaginationInput } from '../utils/validation'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export class UserService {
  async createUser(data: CreateUserInput, createdBy: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        createdBy,
      },
    })

    return this.formatUserResponse(user)
  }

  async updateUser(id: string, data: UpdateUserInput, updatedBy: string): Promise<User> {
    const updateData: any = { ...data, updatedBy }
    
    // Handle dateOfBirth properly - convert empty string to null, valid date to Date object
    if (data.dateOfBirth) {
      if (data.dateOfBirth.trim() === '') {
        updateData.dateOfBirth = null;
      } else {
        updateData.dateOfBirth = new Date(data.dateOfBirth);
      }
    } else {
      updateData.dateOfBirth = null;
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

  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    return user ? this.formatUserResponse(user) : null
  }

  async getUserByEmail(email: string): Promise<User | null> {
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
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
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

  async deactivateUser(id: string, updatedBy: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: { 
        isActive: false,
        updatedBy,
      },
    })

    return this.formatUserResponse(user)
  }

  async activateUser(id: string, updatedBy: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: { 
        isActive: true,
        updatedBy,
      },
    })

    return this.formatUserResponse(user)
  }

  private formatUserResponse(user: any): User {
    // Ensure we're getting the actual values from the database
    const formattedUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone, // This should be "0978471074" from database
      avatar: user.avatar, // This should be "" from database
      bankAccount: user.bankAccount, // This should be "" from database
      about: user.about, // This should be "" from database
      address: user.address, // This should be "Kim Giang, Dai Kim, Hoang Main" from database
      dateOfBirth: user.dateOfBirth, // This should be null from database
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
    };
    
    return formattedUser;
  }
} 