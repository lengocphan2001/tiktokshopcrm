import { PrismaClient } from '@prisma/client'
import { User, CreateUserRequest, UpdateUserRequest, PaginatedUsersResponse } from '../types/user'
import { CreateUserInput, UpdateUserInput, PaginationInput } from '../utils/validation'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'

export class UserService {
  async createUser(data: CreateUserInput, createdBy: string): Promise<User> {
    // Check for existing user with same email
    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUserWithEmail) {
      throw new Error('Email already exists')
    }

    // Check for existing user with same phone (if phone is provided)
    if (data.phone && data.phone.trim() !== '') {
      const existingUserWithPhone = await prisma.user.findFirst({
        where: { 
          phone: data.phone,
          id: { not: existingUserWithEmail?.id } // Exclude current user if updating
        },
      })

      if (existingUserWithPhone) {
        throw new Error('Phone number already exists')
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Handle dateOfBirth properly - convert empty string to null
    let dateOfBirth = null;
    if (data.dateOfBirth && data.dateOfBirth.trim() !== '') {
      dateOfBirth = new Date(data.dateOfBirth);
    }

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        password: hashedPassword,
        avatar: data.avatar || null,
        bankAccount: data.bankAccount || null,
        about: data.about || null,
        address: data.address || null,
        dateOfBirth: dateOfBirth,
        role: data.role,
        status: data.status,
        createdBy,
      },
    })

    return this.formatUserResponse(user)
  }

  async updateUser(id: string, data: UpdateUserInput, updatedBy: string): Promise<User> {
    console.log('=== UPDATE USER DEBUG ===');
    console.log('User ID:', id);
    console.log('Update data:', data);
    console.log('Updated by:', updatedBy);
    
    // Check for existing user with same email (if email is being updated)
    if (data.email) {
      const existingUserWithEmail = await prisma.user.findFirst({
        where: { 
          email: data.email,
          id: { not: id } // Exclude current user
        },
      })

      if (existingUserWithEmail) {
        throw new Error('Email already exists')
      }
    }

    // Check for existing user with same phone (if phone is being updated)
    if (data.phone && data.phone.trim() !== '') {
      const existingUserWithPhone = await prisma.user.findFirst({
        where: { 
          phone: data.phone,
          id: { not: id } // Exclude current user
        },
      })

      if (existingUserWithPhone) {
        throw new Error('Phone number already exists')
      }
    }
    
    // Filter out undefined values and ensure field names match Prisma schema
    const cleanData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanData[key] = value;
      }
    });
    
    console.log('Clean data (filtered):', cleanData);
    
    // Handle dateOfBirth properly - convert empty string to null, valid date to Date object
    if (data.dateOfBirth) {
      if (data.dateOfBirth.trim() === '') {
        cleanData.dateOfBirth = null;
      } else {
        cleanData.dateOfBirth = new Date(data.dateOfBirth);
      }
    } else if (data.dateOfBirth === '') {
      cleanData.dateOfBirth = null;
    }
    
    const updateData: any = { 
      ...cleanData, 
      updatedBy,
      updatedAt: new Date() // Force update timestamp
    }

    console.log('Final update data:', updateData);

    // Test with individual field updates to see which ones work
    console.log('Testing individual field updates...');
    
    const testUpdates: any = {};
    if (updateData.firstName) testUpdates.firstName = updateData.firstName;
    if (updateData.lastName) testUpdates.lastName = updateData.lastName;
    if (updateData.email) testUpdates.email = updateData.email;
    if (updateData.phone) testUpdates.phone = updateData.phone;
    if (updateData.avatar) testUpdates.avatar = updateData.avatar;
    if (updateData.bankAccount) testUpdates.bankAccount = updateData.bankAccount;
    if (updateData.about) testUpdates.about = updateData.about;
    if (updateData.address) testUpdates.address = updateData.address;
    if (updateData.dateOfBirth !== undefined) testUpdates.dateOfBirth = updateData.dateOfBirth;
    if (updateData.role) testUpdates.role = updateData.role;
    if (updateData.status) testUpdates.status = updateData.status;
    if (updateData.isActive !== undefined) testUpdates.isActive = updateData.isActive;
    
    console.log('Test updates:', testUpdates);

    const user = await prisma.user.update({
      where: { id },
      data: testUpdates,
    })

    console.log('Updated user from database:', user);
    console.log('========================');

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
    // Convert null values to empty strings for frontend display
    const formattedUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      bankAccount: user.bankAccount || '',
      about: user.about || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : '', // Convert Date to YYYY-MM-DD format
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