import { Request, Response } from 'express'
import { authenticateUser, generateToken, updateLastLogin } from '../utils/auth'
import { LoginInput } from '../utils/validation'
import { UserService } from '../services/userService'
import bcrypt from 'bcryptjs'

interface LoginResponse {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    avatar?: string
    bankAccount?: string
    about?: string
    address?: string
    dateOfBirth?: string
    role: string
    status: string
    isActive: boolean
    lastLoginAt: string
    createdAt: string
    updatedAt: string
    createdBy?: string
    updatedBy?: string
  }
  token: string
}

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginInput = req.body

      const user = await authenticateUser(email, password)
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        })
      }

      // Update last login
      await updateLastLogin(user.id)

      // Get fresh user data with all fields
      const userService = new UserService()
      const freshUser = await userService.getUserById(user.id)

      if (!freshUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found after authentication'
        })
      }

      const tokenPayload = {
        userId: freshUser.id,
        email: freshUser.email,
        role: freshUser.role
      }

      const token = generateToken(tokenPayload)

      const response: LoginResponse = {
        user: freshUser as any, // Cast to fix type mismatch
        token
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: response
      })
    } catch (error) {
      console.error('Login error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async me(req: Request, res: Response) {
    try {
      // User is already authenticated by middleware
      const authenticatedUser = (req as any).user

      // Fetch fresh user data from database
      const userService = new UserService()
      const freshUser = await userService.getUserById(authenticatedUser.id)

      if (!freshUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Convert dates to ISO strings for frontend, but preserve all other fields
      const userForFrontend = {
        ...freshUser,
        lastLoginAt: freshUser.lastLoginAt ? new Date(freshUser.lastLoginAt).toISOString() : null,
        createdAt: freshUser.createdAt ? new Date(freshUser.createdAt).toISOString() : null,
        updatedAt: freshUser.updatedAt ? new Date(freshUser.updatedAt).toISOString() : null,
        dateOfBirth: freshUser.dateOfBirth ? new Date(freshUser.dateOfBirth).toISOString() : null,
      };

      return res.status(200).json({
        success: true,
        data: userForFrontend
      })
    } catch (error) {
      console.error('Me error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
} 