import { User } from 'src/types/session';
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

  startRace: async (userId: string, groupId: string, groupUserId?: string): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.SESSIONS.GROUPS.START_RACE(groupId, userId, groupUserId));
    return response.data;
  },

  stopRace: async (userId: string, groupId: string, groupUserId?: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.SESSIONS.GROUPS.STOP_RACE(groupId, userId, groupUserId));
  },
}; 