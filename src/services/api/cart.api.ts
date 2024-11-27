import { Cart, FuelLog, MaintenanceLog } from 'src/types/cart';
import { API_ENDPOINTS } from './endpoints';
import { CartResponse, CartQueryParams, AssignCartData, RefuelData } from './api.types';

export const cartApi = {
  list: async (params: CartQueryParams): Promise<CartResponse> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
    });

    const res = await fetch(`${API_ENDPOINTS.CARTS.LIST}?${searchParams}`);
    if (!res.ok) throw new Error('Failed to fetch carts');
    return res.json();
  },

  getById: async (id: string): Promise<Cart> => {
    const res = await fetch(API_ENDPOINTS.CARTS.DETAIL(id));
    if (!res.ok) throw new Error('Failed to fetch cart details');
    return res.json();
  },

  create: async (data: Partial<Cart>): Promise<Cart> => {
    const res = await fetch(API_ENDPOINTS.CARTS.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create cart');
    return res.json();
  },

  update: async (id: string, data: Partial<Cart>): Promise<Cart> => {
    const res = await fetch(API_ENDPOINTS.CARTS.UPDATE(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update cart');
    return res.json();
  },

  assign: async (id: string, data: AssignCartData): Promise<Cart> => {
    const res = await fetch(API_ENDPOINTS.CARTS.ASSIGN(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to assign cart');
    return res.json();
  },

  refuel: async (id: string, data: RefuelData): Promise<FuelLog> => {
    const res = await fetch(API_ENDPOINTS.CARTS.REFUEL(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to refuel cart');
    return res.json();
  },

  getFuelLogs: async (id: string): Promise<FuelLog[]> => {
    const res = await fetch(API_ENDPOINTS.CARTS.FUEL_LOGS(id));
    if (!res.ok) throw new Error('Failed to fetch fuel logs');
    return res.json();
  },

  getMaintenanceLogs: async (id: string): Promise<MaintenanceLog[]> => {
    const res = await fetch(API_ENDPOINTS.CARTS.MAINTENANCE_LOGS(id));
    if (!res.ok) throw new Error('Failed to fetch maintenance logs');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(API_ENDPOINTS.CARTS.DELETE(id), {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete cart');
  },
}; 