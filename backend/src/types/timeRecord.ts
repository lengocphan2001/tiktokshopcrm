export enum TimeRecordStatus {
  CLOCKED_IN = 'CLOCKED_IN',
  CLOCKED_OUT = 'CLOCKED_OUT',
  BREAK_START = 'BREAK_START',
  BREAK_END = 'BREAK_END'
}

export interface TimeRecord {
  id: string
  userId: string
  status: TimeRecordStatus
  clockInAt?: string
  clockOutAt?: string
  breakStartAt?: string
  breakEndAt?: string
  totalHours?: number
  breakHours?: number
  workHours?: number
  notes?: string
  location?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
}

export interface CreateTimeRecordRequest {
  status: TimeRecordStatus
  notes?: string
  location?: string
}

export interface UpdateTimeRecordRequest {
  status?: TimeRecordStatus
  notes?: string
  location?: string
}

export interface TimeRecordStats {
  totalWorkDays: number
  totalWorkHours: number
  averageWorkHours: number
  currentWeekHours: number
  currentMonthHours: number
  lastClockIn?: string
  isCurrentlyClockedIn: boolean
  isOnBreak: boolean
}

export interface PaginatedTimeRecordsResponse {
  data: TimeRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
