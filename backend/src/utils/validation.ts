import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  avatar: z.string().optional(),
  bankAccount: z.string().optional(),
  about: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  bankAccount: z.string().optional(),
  about: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})

// Time Record validation schemas
export const createTimeRecordSchema = z.object({
  status: z.enum(['CLOCKED_IN', 'CLOCKED_OUT', 'BREAK_START', 'BREAK_END']),
  notes: z.string().optional(),
  location: z.string().optional(),
})

export const updateTimeRecordSchema = z.object({
  status: z.enum(['CLOCKED_IN', 'CLOCKED_OUT', 'BREAK_START', 'BREAK_END']).optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
})

export const timeRecordPaginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['CLOCKED_IN', 'CLOCKED_OUT', 'BREAK_START', 'BREAK_END']).optional(),
})

export const createTaskTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  price: z.coerce.number().min(0, 'Price must be at least 0').max(999999.99, 'Price too high'),
})

export const updateTaskTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  price: z.coerce.number().min(0, 'Price must be at least 0').max(999999.99, 'Price too high').optional(),
})

export const taskTypePaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
})

export const createTaskSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  resource: z.string().optional(),
  result: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  isActive: z.boolean().optional(),
  taskTypeId: z.string().min(1, 'Task type is required'),
  assigneeId: z.string().min(1, 'Assignee is required'),
  createdById: z.string().optional(),
  updatedBy: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be equal to or after start date',
  path: ['endDate'],
})

export const updateTaskSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long').optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  resource: z.string().optional(),
  result: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  isActive: z.boolean().optional(),
  taskTypeId: z.string().min(1, 'Task type is required').optional(),
  assigneeId: z.string().min(1, 'Assignee is required').optional(),
  createdById: z.string().optional(),
  updatedBy: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate
  }
  return true
}, {
  message: 'End date must be equal to or after start date',
  path: ['endDate'],
})

export const taskPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  taskTypeId: z.string().optional(),
  assigneeId: z.string().optional(),
  createdById: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PaginationInput = z.infer<typeof paginationSchema>

export type CreateTaskTypeInput = z.infer<typeof createTaskTypeSchema>
export type UpdateTaskTypeInput = z.infer<typeof updateTaskTypeSchema>
export type TaskTypePaginationInput = z.infer<typeof taskTypePaginationSchema>

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskPaginationInput = z.infer<typeof taskPaginationSchema>

export type CreateTimeRecordInput = z.infer<typeof createTimeRecordSchema>
export type UpdateTimeRecordInput = z.infer<typeof updateTimeRecordSchema>
export type TimeRecordPaginationInput = z.infer<typeof timeRecordPaginationSchema> 