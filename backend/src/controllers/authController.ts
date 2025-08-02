import { Request, Response } from 'express'
import { authenticateUser, generateToken, updateLastLogin } from '../utils/auth'
import { LoginInput } from '../utils/validation'
import { LoginResponse } from '../types/user'

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginInput = req.body

      console.log('Login attempt for email:', email) // Debug log

      const user = await authenticateUser(email, password)
      if (!user) {
        console.log('Authentication failed for email:', email) // Debug log
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        })
      }

      console.log('Authentication successful for user:', user) // Debug log

      // Update last login
      await updateLastLogin(user.id)

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      }

      console.log('Generating token with payload:', tokenPayload) // Debug log

      const token = generateToken(tokenPayload)

      const response: LoginResponse = {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: null,
          avatar: null,
          bankAccount: null,
          about: null,
          address: null,
          dateOfBirth: null,
          role: user.role,
          status: 'ACTIVE',
          isActive: user.isActive,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: null,
          updatedBy: null,
        },
        token
      }

      console.log('Login response:', { success: true, user: response.user }) // Debug log

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
      const user = (req as any).user

      console.log('Me endpoint - user:', user) // Debug log

      return res.status(200).json({
        success: true,
        data: user
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