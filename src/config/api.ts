export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000, // 10 seconds
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
  },
  TASK_TYPES: {
    LIST: '/task-types',
    CREATE: '/task-types',
    UPDATE: (id: string) => `/task-types/${id}`,
    DELETE: (id: string) => `/task-types/${id}`,
    ACTIVATE: (id: string) => `/task-types/${id}/activate`,
    DEACTIVATE: (id: string) => `/task-types/${id}/deactivate`,
  },
} as const; 