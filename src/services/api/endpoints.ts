const BASE_URL = process?.env?.API_BASE_URL || console.error('API URI is not set');

const createEndpoint = (path: string) => `${BASE_URL}${path}`;

export const API_ENDPOINTS = {
  SESSIONS: {
    LIST: createEndpoint('/api/sessions'),
    HISTORY: createEndpoint('/api/sessions/history'),
    DETAIL: (id: string) => createEndpoint(`/api/sessions/${id}`),
    CREATE: createEndpoint('/api/sessions'),
    UPDATE: (id: string) => createEndpoint(`/api/sessions/${id}`),
    DELETE: (id: string) => createEndpoint(`/api/sessions/${id}`),
    START_RACE: (id: string) => createEndpoint(`/api/sessions/${id}/race/start`),
    STOP_RACE: (id: string) => createEndpoint(`/api/sessions/${id}/race/stop`),
  },
  USERS: {
    LIST: createEndpoint('/api/users'),
    DETAIL: (id: string) => createEndpoint(`/api/users/${id}`),
    CREATE: createEndpoint('/api/users'),
    UPDATE: (id: string) => createEndpoint(`/api/users/${id}`),
    DELETE: (id: string) => createEndpoint(`/api/users/${id}`),
  },
  CARTS: {
    LIST: createEndpoint('/api/carts'),
    DETAIL: (id: string) => createEndpoint(`/api/carts/${id}`),
    CREATE: createEndpoint('/api/carts'),
    UPDATE: (id: string) => createEndpoint(`/api/carts/${id}`),
    DELETE: (id: string) => createEndpoint(`/api/carts/${id}`),
    ASSIGN: (id: string) => createEndpoint(`/api/carts/${id}/assign`),
    REFUEL: (id: string) => createEndpoint(`/api/carts/${id}/refuel`),
    MAINTENANCE: (id: string) => createEndpoint(`/api/carts/${id}/maintenance`),
    FUEL_LOGS: (id: string) => createEndpoint(`/api/carts/${id}/fuel-logs`),
    MAINTENANCE_LOGS: (id: string) => createEndpoint(`/api/carts/${id}/maintenance-logs`),
  },
} as const; 