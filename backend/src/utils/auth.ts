import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { prisma } from '../config/database'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const authenticateUser = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true,
      }
    })

    if (!user) {
      return null
    }

    if (!user.isActive) {
      return null
    }

    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return null
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export const updateLastLogin = async (id: string): Promise<void> => {
  await prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  })
}

export const isAdmin = (role: string): boolean => {
  return role === 'ADMIN'
}

export const requireAuth = async (token: string | undefined) => {
  if (!token) {
    throw new Error('Authentication required')
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw new Error('Invalid token')
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true,
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    if (!user.isActive) {
      throw new Error('User is inactive')
    }

    return user
  } catch (error) {
    throw error
  }
}

export const requireAdmin = async (token: string | undefined) => {
  const user = await requireAuth(token)
  
  if (!isAdmin(user.role)) {
    throw new Error('Admin access required')
  }
  
  return user
} 