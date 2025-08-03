import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Comprehensive debug logging
      console.log('=== VALIDATION MIDDLEWARE DEBUG ===')
      console.log('Request method:', req.method)
      console.log('Request URL:', req.url)
      console.log('Request headers:', JSON.stringify(req.headers, null, 2))
      console.log('Content-Type:', req.headers['content-type'])
      console.log('Content-Length:', req.headers['content-length'])
      console.log('Request body:', req.body)
      console.log('Request body type:', typeof req.body)
      console.log('Request body keys:', req.body ? Object.keys(req.body) : 'No body')
      console.log('Request query:', req.query)
      console.log('Raw body exists:', !!req.body)
      console.log('Body is object:', typeof req.body === 'object')
      console.log('Body is array:', Array.isArray(req.body))
      console.log('Body is null:', req.body === null)
      console.log('Body is undefined:', req.body === undefined)
      console.log('=====================================')
      
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
      // But be more lenient - check if body exists and has content
      if (!req.body) {
        console.log('WARNING: Request body is null or undefined')
        return res.status(400).json({
          success: false,
          message: 'Request body is required',
          errors: [{ message: 'Request body is null or undefined' }]
        })
      }
      
      // Check if body is an empty object (but not null/undefined)
      if (typeof req.body === 'object' && Object.keys(req.body).length === 0) {
        console.log('WARNING: Request body is an empty object')
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
      console.log('Validation error details:', error.errors)
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }
  }
} 