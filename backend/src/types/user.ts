import { User, UserRole, UserStatus } from '@prisma/client'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  avatar?: string
  bankAccount?: string
  about?: string
  address?: string
  dateOfBirth?: string
  role?: UserRole
  status?: UserStatus
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  avatar?: string
  bankAccount?: string
  about?: string
  address?: string
  dateOfBirth?: string
  role?: UserRole
  status?: UserStatus
  isActive?: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: Omit<User, 'password'>
  token: string
}

export interface UserResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  bankAccount?: string
  about?: string
  address?: string
  dateOfBirth?: Date
  role: UserRole
  status: UserStatus
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}

export interface PaginatedUsersResponse {
  users: UserResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
} 