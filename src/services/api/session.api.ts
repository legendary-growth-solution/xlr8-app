import { Session, CreateSessionData, Group } from 'src/types/session';
import { API_ENDPOINTS } from './endpoints';
import { SessionResponse, SessionQueryParams } from './api.types';
import { apiClient } from './api-client';

export const sessionApi = {
  list: async (params: SessionQueryParams): Promise<SessionResponse> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
    });

    const response = await apiClient.get(`${API_ENDPOINTS.SESSIONS.LIST}?${searchParams}`);
    return response.data;
  },

  history: async (params: SessionQueryParams): Promise<SessionResponse> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
    });

    const response = await apiClient.get(`${API_ENDPOINTS.SESSIONS.HISTORY}?${searchParams}`);
    return response.data;
  },

  getById: async (id: string): Promise<Session> => {
    const response = await apiClient.get(API_ENDPOINTS.SESSIONS.DETAIL(id));
    return response.data;
  },

  create: async (data: CreateSessionData): Promise<Session> => {
    const response = await apiClient.post(API_ENDPOINTS.SESSIONS.CREATE, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Session>): Promise<Session> => {
    const response = await apiClient.put(API_ENDPOINTS.SESSIONS.UPDATE(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SESSIONS.DELETE(id));
  },

  getLatestSsnId: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.SESSIONS.LATEST);
    return response.data;
  },

  toggleStatus: async (id: string, active: boolean): Promise<Session> => 
    sessionApi.update(id, { status: active ? 'active' : 'completed' }),

  stopRace: async (id: string): Promise<Session> => {
    const response = await apiClient.post(API_ENDPOINTS.SESSIONS.STOP_RACE(id));
    return response.data;
  },

  createGroup: async (sessionId: string, data: { name: string }): Promise<Group> => {
    const response = await apiClient.post(`${API_ENDPOINTS.SESSIONS.DETAIL(sessionId)}/groups`, data);
    return response.data;
  },

  updateGroup: async (sessionId: string, groupId: string, data: Partial<Group>): Promise<Group> => {
    const response = await apiClient.put(`${API_ENDPOINTS.SESSIONS.DETAIL(sessionId)}/groups/${groupId}`, data);
    return response.data;
  },

  deleteGroup: async (sessionId: string, groupId: string): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.SESSIONS.DETAIL(sessionId)}/groups/${groupId}`);
  },

  startRace: async (groupId: string, data: { 
    userId: string;
    groupUserId: string;
    cartId: string;
  }) => {
    const response = await apiClient.post(`${API_ENDPOINTS.SESSIONS.START_RACE(groupId, data.userId)}`, data);
    return response.data;
  },
}; 