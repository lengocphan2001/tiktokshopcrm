import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // For GET requests, we don't require a body - use query params
      if (req.method === 'GET') {
        const validatedData = schema.parse({
          ...req.query,
          ...req.params
        })
        req.body = validatedData
        next()
        return
      }
      
      // For other methods, check if body is empty or undefined
      if (!req.body) {
        return res.status(400).json({
          success: false,
          message: 'Request body is required',
          errors: [{ message: 'Request body is null or undefined' }]
        })
      }
      
      // Check if body is an empty object (but not null/undefined)
      // For PUT and POST requests, allow empty objects as they might be valid
      if (typeof req.body === 'object' && Object.keys(req.body).length === 0 && req.method !== 'PUT' && req.method !== 'POST') {
        return res.status(400).json({
          success: false,
          message: 'Request body is required',
          errors: [{ message: 'Request body is empty' }]
        })
      }
      
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