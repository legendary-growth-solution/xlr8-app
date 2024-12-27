export const BASE_URL = import.meta.env.VITE_API_BASE_URL || console.error('API URI is not set');

export const createEndpoint = (path: string) => `${BASE_URL}${path}`;

export const API_ENDPOINTS = {
  GENERATE_HASH: createEndpoint('/api/auth/generate-hash'),
  AUTH: {
    VALIDATE_CODE: createEndpoint('/api/auth/validate-code'),
  },
  SESSIONS: {
    LIST: createEndpoint('/api/sessions/'),
    HISTORY: createEndpoint('/api/sessions/history'),
    DETAIL: (id: string) => createEndpoint(`/api/sessions/${id}`),
    CREATE: createEndpoint('/api/sessions/'),
    UPDATE: (id: string) => createEndpoint(`/api/sessions/${id}`),
    DELETE: (id: string) => createEndpoint(`/api/sessions/${id}`),
    LATEST: createEndpoint('/api/sessions/latest'),
    START_RACE: (id: string, userId: string) =>
      createEndpoint(`/api/sessions/${id}/race/${userId}/start`),
    STOP_RACE: (id: string) => createEndpoint(`/api/sessions/${id}/race/stop`),
    GROUPS: {
      CREATE: (sessionId: string) => createEndpoint(`/api/sessions/${sessionId}/groups`),
      UPDATE: (groupId: string) => createEndpoint(`/api/groups/${groupId}`),
      DELETE: (groupId: string) => createEndpoint(`/api/groups/${groupId}`),
      ADD_USERS: (groupId: string) => createEndpoint(`/api/groups/${groupId}/users`),
      GET_USERS: (groupId: string) => createEndpoint(`/api/groups/${groupId}/users`),
      DELETE_MEMBER: (groupId: string, userId: string) =>
        createEndpoint(`/api/groups/${groupId}/users/${userId}`),
      ACTIVE_USERS: createEndpoint('/api/groups/active-users'),
      START_RACE: (id: string, userId: string, groupUserId?: string) =>
        groupUserId
          ? createEndpoint(`/api/groups/user/${groupUserId}/race/start`)
          : createEndpoint(`/api/groups/${id}/race/${userId}/start`),
      STOP_RACE: (id: string, userId: string, groupUserId?: string) =>
        groupUserId
          ? createEndpoint(`/api/groups/user/${groupUserId}/race/stop`)
          : createEndpoint(`/api/groups/${id}/race/${userId}/stop`),
      RECORD_LAP: (id: string, userId: string, groupUserId?: string) =>
        groupUserId
          ? createEndpoint(`/api/groups/user/${groupUserId}/race/lap`)
          : createEndpoint(`/api/groups/${id}/race/${userId}/lap`),
    },
  },
  USERS: {
    LIST: createEndpoint('/api/users/'),
    DETAIL: (id: string) => createEndpoint(`/api/users/${id}`),
    CREATE: createEndpoint('/api/users/'),
    UPDATE: (id: string) => createEndpoint(`/api/users/${id}`),
    DELETE: (id: string) => createEndpoint(`/api/users/${id}`),
  },
  CARTS: {
    LIST: createEndpoint('/api/carts/'),
    DETAIL: (id: string) => createEndpoint(`/api/carts/${id}`),
    CREATE: createEndpoint('/api/carts/'),
    UPDATE: (id: string) => createEndpoint(`/api/carts/${id}`),
    DELETE: (id: string) => createEndpoint(`/api/carts/${id}`),
    ASSIGN: (id: string) => createEndpoint(`/api/carts/${id}/assign`),
    REFUEL: (id: string) => createEndpoint(`/api/carts/${id}/refuel`),
    MAINTENANCE: {
      GET: (id?: string) => createEndpoint(`/api/carts/maintenance-logs${id ? `/${id}` : ''}`),
      UPDATE: (id: string) => createEndpoint(`/api/carts/${id}/maintenance`),
    },
    FUEL_LOGS: (id?: string) => createEndpoint(`/api/carts/fuel-logs${id ? `/${id}` : ''}`),
    LAP_LOGS: (id?: string) => createEndpoint(`/api/carts/lap-logs${id ? `/${id}` : ''}`),
  },
  GET_LIVE_LEADERBOARD: (sessionId: string) =>
    createEndpoint(`/api/results/session/${sessionId}/live-leaderboard`),
  billing: {
    plans: '/api/billing/plans',
    discountCodes: '/api/billing/discount-codes',
    validateDiscountCode: '/api/billing/discount-codes/validate',
    generateBill: (groupId: string) => `/api/billing/groups/${groupId}/generate`,
    getBillingData: (groupId: string) => `/api/billing/groups/${groupId}/data`,
  },
} as const;
