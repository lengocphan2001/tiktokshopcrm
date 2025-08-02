import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        ...req.body,
        ...req.query,
        ...req.params
      })
      
      req.body = validatedData
      next()
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }
  }
} 