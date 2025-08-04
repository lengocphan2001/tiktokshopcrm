import { Request, Response } from 'express'
import { UserService } from '../services/userService'
import { CreateUserInput, UpdateUserInput, PaginationInput } from '../utils/validation'
import { AuthenticatedRequest } from '../middleware/auth'

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const data: CreateUserInput = req.body
      const createdBy = req.user!.id

      // Check if email already exists
      const existingUser = await this.userService.getUserByEmail(data.email)
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        })
      }

      const user = await this.userService.createUser(data, createdBy)

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      })
    } catch (error) {
      console.error('Create user error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      console.log('=== UPDATE USER CONTROLLER DEBUG ===');
      console.log('Request body:', req.body);
      console.log('Request params:', req.params);
      
      const { id } = req.params
      const data: UpdateUserInput = req.body
      const updatedBy = req.user!.id

      console.log('User ID:', id);
      console.log('Update data:', data);
      console.log('Updated by:', updatedBy);

      // Check if user exists
      const existingUser = await this.userService.getUserById(id)
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      console.log('Existing user:', existingUser);

      // Check if email is being updated and if it already exists
      if (data.email && data.email !== existingUser.email) {
        const userWithEmail = await this.userService.getUserByEmail(data.email)
        if (userWithEmail && userWithEmail.id !== id) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
          })
        }
      }

      const user = await this.userService.updateUser(id, data, updatedBy)

      console.log('Updated user response:', user);
      console.log('=====================================');

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      })
    } catch (error) {
      console.error('Update user error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async updateOwnProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const data: UpdateUserInput = req.body
      const userId = req.user!.id

      // Check if user exists
      const existingUser = await this.userService.getUserById(userId)
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Check if email is being updated and if it already exists
      if (data.email && data.email !== existingUser.email) {
        const userWithEmail = await this.userService.getUserByEmail(data.email)
        if (userWithEmail && userWithEmail.id !== userId) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
          })
        }
      }

      // Prevent users from changing their role or status
      const safeData = { ...data }
      delete safeData.role
      delete safeData.status
      delete safeData.isActive

      const user = await this.userService.updateUser(userId, safeData, userId)

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      })
    } catch (error) {
      console.error('Update own profile error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params

      // Check if user exists
      const existingUser = await this.userService.getUserById(id)
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      await this.userService.deleteUser(id)

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      })
    } catch (error) {
      console.error('Delete user error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params

      const user = await this.userService.getUserById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: user
      })
    } catch (error) {
      console.error('Get user error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const params: PaginationInput = req.body as any

      const result = await this.userService.getUsers(params)

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Get users error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async deactivateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const updatedBy = req.user!.id

      // Check if user exists
      const existingUser = await this.userService.getUserById(id)
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      const user = await this.userService.deactivateUser(id, updatedBy)

      return res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: user
      })
    } catch (error) {
      console.error('Deactivate user error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  async activateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params
      const updatedBy = req.user!.id

      // Check if user exists
      const existingUser = await this.userService.getUserById(id)
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      const user = await this.userService.activateUser(id, updatedBy)

      return res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: user
      })
    } catch (error) {
      console.error('Activate user error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
} 