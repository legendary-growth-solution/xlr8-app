import { Session } from 'src/types/session';
import { API_ENDPOINTS } from './endpoints';
import { SessionResponse, SessionQueryParams } from './api.types';

export const sessionApi = {
  list: async (params: SessionQueryParams): Promise<SessionResponse> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
    });

    const res = await fetch(`${API_ENDPOINTS.SESSIONS.LIST}?${searchParams}`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  history: async (params: SessionQueryParams): Promise<SessionResponse> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
    });

    const res = await fetch(`${API_ENDPOINTS.SESSIONS.HISTORY}?${searchParams}`);
    if (!res.ok) throw new Error('Failed to fetch session history');
    return res.json();
  },

  getById: async (id: string): Promise<Session> => {
    const res = await fetch(API_ENDPOINTS.SESSIONS.DETAIL(id));
    if (!res.ok) throw new Error('Failed to fetch session details');
    return res.json();
  },

  create: async (data: Partial<Session>): Promise<Session> => {
    const res = await fetch(API_ENDPOINTS.SESSIONS.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create session');
    return res.json();
  },

  update: async (id: string, data: Partial<Session>): Promise<Session> => {
    const res = await fetch(API_ENDPOINTS.SESSIONS.UPDATE(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update session');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(API_ENDPOINTS.SESSIONS.DELETE(id), {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete session');
  },
  toggleStatus: async (id: string, active: boolean): Promise<Session> => 
    sessionApi.update(id, { status: active ? 'active' : 'completed' }),

  startRace: async (id: string): Promise<Session> => {
    const res = await fetch(API_ENDPOINTS.SESSIONS.START_RACE(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to start race');
    return res.json();
  },

  stopRace: async (id: string): Promise<Session> => {
    const res = await fetch(API_ENDPOINTS.SESSIONS.STOP_RACE(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to stop race');
    return res.json();
  },
}; 