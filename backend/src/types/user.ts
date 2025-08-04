export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  bankAccount?: string
  about?: string
  address?: string
  dateOfBirth?: string
  role: UserRole
  status: UserStatus
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
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

export interface PaginatedUsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface CreateTaskTypeRequest {
  name: string
  price: number
}

export interface UpdateTaskTypeRequest {
  name?: string
  price?: number
}

export interface TaskTypeResponse {
  id: string
  name: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface PaginatedTaskTypesResponse {
  taskTypes: TaskTypeResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Task {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  resource?: string
  result?: string
  status: TaskStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
  taskTypeId: string
  taskType: TaskTypeResponse
  assigneeId: string
  assignee: User
  createdById: string
  createdBy: User
  updatedBy?: string
}

export interface CreateTaskRequest {
  name: string
  description?: string
  startDate: string
  endDate: string
  resource?: string
  result?: string
  taskTypeId: string
  assigneeId: string
}

export interface UpdateTaskRequest {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  resource?: string
  result?: string
  taskTypeId?: string
  assigneeId?: string
  status?: TaskStatus
}

export interface PaginatedTasksResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
  totalPages: number
} 