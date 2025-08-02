const bcrypt = require('bcryptjs')
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'
import { JWTPayload } from '../types/user'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
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

    console.log('Found user:', user) // Debug log

    if (!user) {
      console.log('User not found for email:', email)
      return null
    }

    if (!user.isActive) {
      console.log('User is inactive:', email)
      return null
    }

    const isValidPassword = await comparePassword(password, user.password)
    console.log('Password valid:', isValidPassword) // Debug log

    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return null
    }

    const { password: _, ...userWithoutPassword } = user
    console.log('Returning user:', userWithoutPassword) // Debug log
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

    console.log('requireAuth - Found user:', user) // Debug log

    if (!user) {
      throw new Error('User not found')
    }

    if (!user.isActive) {
      throw new Error('User is inactive')
    }

    return user
  } catch (error) {
    console.error('requireAuth error:', error)
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