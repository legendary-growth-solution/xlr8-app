export const API_ENDPOINTS = {
  SESSIONS: {
    LIST: '/api/sessions',
    HISTORY: '/api/sessions/history',
    DETAIL: (id: string) => `/api/sessions/${id}`,
    CREATE: '/api/sessions',
    UPDATE: (id: string) => `/api/sessions/${id}`,
    DELETE: (id: string) => `/api/sessions/${id}`,
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: string) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },
  CARTS: {
    LIST: '/api/carts',
    DETAIL: (id: string) => `/api/carts/${id}`,
    CREATE: '/api/carts',
    UPDATE: (id: string) => `/api/carts/${id}`,
    DELETE: (id: string) => `/api/carts/${id}`,
    ASSIGN: (id: string) => `/api/carts/${id}/assign`,
    REFUEL: (id: string) => `/api/carts/${id}/refuel`,
    MAINTENANCE: (id: string) => `/api/carts/${id}/maintenance`,
    FUEL_LOGS: (id: string) => `/api/carts/${id}/fuel-logs`,
    MAINTENANCE_LOGS: (id: string) => `/api/carts/${id}/maintenance-logs`,
  },
} as const; 