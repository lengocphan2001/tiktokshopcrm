import { Request, Response, NextFunction } from 'express'
import { requireAuth, requireAdmin } from '../utils/auth'

export interface AuthenticatedRequest extends Request {
  user?: any
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      })
    }

    const user = await requireAuth(token)
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Invalid token' 
    })
  }
}

export const requireAdminRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('=== AUTH MIDDLEWARE DEBUG ===')
    console.log('Starting authentication check')
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    console.log('Auth header:', authHeader)
    console.log('Token:', token ? 'Present' : 'Missing')
    console.log('Request body before auth:', req.body)
    console.log('Request body type before auth:', typeof req.body)

    if (!token) {
      console.log('No token provided')
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      })
    }

    const user = await requireAdmin(token)
    console.log('User authenticated:', user)
    req.user = user
    console.log('Request body after auth:', req.body)
    console.log('Calling next()')
    console.log('===============================')
    next()
  } catch (error) {
    console.log('Authentication failed:', error)
    return res.status(403).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Admin access required' 
    })
  }
} 