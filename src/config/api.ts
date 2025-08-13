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
    PROFILE: '/users/profile',
  },
  TASK_TYPES: {
    LIST: '/task-types',
    CREATE: '/task-types',
    UPDATE: (id: string) => `/task-types/${id}`,
    DELETE: (id: string) => `/task-types/${id}`,
    ACTIVATE: (id: string) => `/task-types/${id}/activate`,
    DEACTIVATE: (id: string) => `/task-types/${id}/deactivate`,
  },
  UPLOAD: {
    AVATAR: '/upload/avatar',
  },
  TASKS: {
    LIST: '/tasks/list',
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    ACTIVATE: (id: string) => `/tasks/${id}/activate`,
    DEACTIVATE: (id: string) => `/tasks/${id}/deactivate`,
    UPDATE_STATUS: (id: string) => `/tasks/${id}/status`,
    UPDATE_RESULT: (id: string) => `/tasks/${id}/result`,
    BY_ASSIGNEE: (assigneeId: string) => `/tasks/assignee/${assigneeId}`,
  },
  TIKTOK_SHOP: {
    TEST_CONNECTION: '/tiktok-shop/test-connection',
    STATS: '/tiktok-shop/stats',
    PRODUCTS: '/tiktok-shop/products',
    CREATE_PRODUCT: '/tiktok-shop/products',
    UPDATE_PRODUCT: (productId: string) => `/tiktok-shop/products/${productId}`,
    DELETE_PRODUCT: (productId: string) => `/tiktok-shop/products/${productId}`,
    ORDERS: '/tiktok-shop/orders',
    ORDER_DETAILS: (orderId: string) => `/tiktok-shop/orders/${orderId}`,
    UPDATE_ORDER_STATUS: (orderId: string) => `/tiktok-shop/orders/${orderId}/status`,
  },
} as const; 