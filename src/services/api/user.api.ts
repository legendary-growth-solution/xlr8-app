import { User } from 'src/types/user';
import { apiClient } from './api-client';
import { API_ENDPOINTS } from './endpoints';

export interface UserResponse {
  users: User[];
  pagination: any;
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface UserSessionHistory {
  user_name: string;
  total_count: number;
  sessions: Array<{
    session_id: string;
    session_name: string;
    start_time: string;
    end_time: string;
    group_id: string;
    cart_number?: string;
    laps?: number;
    best_lap?: number;
    total_time?: number;
    performance: {
      laps: Array<{
        lap_id: string;
        duration: number;
        lap_number: number;
        timestamp: string;
      }>;
      best_lap: number | null;
      total_laps: number;
      total_time: number;
    };
    plan_id: string;
    user_name: string;
  }>;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  debug_info?: any;
}

export interface UserStats {
  user_id: string;
  user_name: string;
  stats: {
    total_laps: number;
    total_time: number;
    best_time: number | null;
    total_sessions: number;
    average_lap_time: number | null;
  };
  ranking: {
    position: number | null;
    total_users: number;
  };
}

export const userApi = {
  list: async (params: UserQueryParams): Promise<UserResponse> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
    });

    const response = await apiClient.get(`${API_ENDPOINTS.USERS.LIST}?${searchParams}`);
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    return response.data;
  },

  create: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
  },

  getStats: async (id: string): Promise<UserStats> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.STATS(id));
    return response.data;
  },

  getSessionHistory: async (id: string, params: { page: number, limit: number } = { page: 1, limit: 10 }): Promise<UserSessionHistory> => {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.limit.toString(),
    });
    const response = await apiClient.get(`${API_ENDPOINTS.USERS.SESSIONS(id)}?${searchParams}`);
    return response.data;
  },

  startRace: async (userId: string, groupId: string, groupUserId?: string): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.SESSIONS.GROUPS.START_RACE(groupId, userId, groupUserId));
    return response.data;
  },

  stopRace: async (userId: string, groupId: string, groupUserId?: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.SESSIONS.GROUPS.STOP_RACE(groupId, userId, groupUserId));
  },
};