import { User } from 'src/types/session';
import { API_ENDPOINTS } from './endpoints';
import { UserResponse, UserQueryParams } from './api.types';

export const userApi = {
  list: async (params: UserQueryParams): Promise<UserResponse> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
    });

    const res = await fetch(`${API_ENDPOINTS.USERS.LIST}?${searchParams}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  getById: async (id: string): Promise<User> => {
    const res = await fetch(API_ENDPOINTS.USERS.DETAIL(id));
    if (!res.ok) throw new Error('Failed to fetch user details');
    return res.json();
  },

  create: async (data: Partial<User>): Promise<User> => {
    const res = await fetch(API_ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const res = await fetch(API_ENDPOINTS.USERS.UPDATE(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(API_ENDPOINTS.USERS.DELETE(id), {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
  },
}; 