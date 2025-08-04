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
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      })
    }

    const user = await requireAdmin(token)
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Admin access required' 
    })
  }
} 