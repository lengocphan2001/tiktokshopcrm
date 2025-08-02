import { z } from 'zod'

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  avatar: z.string().url('Invalid avatar URL').optional(),
  bankAccount: z.string().optional(),
  about: z.string().max(1000, 'About text too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  dateOfBirth: z.string().datetime().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  bankAccount: z.string().optional(),
  about: z.string().max(1000, 'About text too long').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  dateOfBirth: z.string().datetime().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  isActive: z.boolean().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PaginationInput = z.infer<typeof paginationSchema> 