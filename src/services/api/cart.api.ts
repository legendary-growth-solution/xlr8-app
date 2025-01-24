import { Cart, FuelLog, MaintenanceLog, LapLog } from 'src/types/cart';
import { API_ENDPOINTS } from './endpoints';
import { CartResponse, CartQueryParams, AssignCartData, RefuelData } from './api.types';
import { apiClient } from './api-client';

export interface AssignmentHistory {
  group_user_mapping_id: string;
  timestamp: string;
  user_id: string;
  user_name?: string;
  status: 'assigned' | 'unassigned';
  session_id: string;
}

export interface AssignmentHistoryResponse {
  history: AssignmentHistory[];
  total: number;
  has_more: boolean;
}

export const cartApi = {
  list: async (params: CartQueryParams): Promise<CartResponse> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
    });

    const response = await apiClient.get(`${API_ENDPOINTS.CARTS.LIST}?${searchParams}`);
    return response.data;
  },

  getById: async (id: string): Promise<Cart> => {
    const response = await apiClient.get(API_ENDPOINTS.CARTS.DETAIL(id));
    return response.data;
  },

  create: async (data: Partial<any>): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.CARTS.CREATE, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Cart>): Promise<Cart> => {
    const response = await apiClient.put(API_ENDPOINTS.CARTS.UPDATE(id), data);
    return response.data;
  },

  assign: async (id: string, data: AssignCartData): Promise<Cart> => {
    const response = await apiClient.post(API_ENDPOINTS.CARTS.ASSIGN(id), data);
    return response.data;
  },

  refuel: async (id: string, data: RefuelData): Promise<FuelLog> => {
    const response = await apiClient.post(API_ENDPOINTS.CARTS.REFUEL(id), data);
    return response.data;
  },

  updateMaintenance: async (id: string, data: Partial<MaintenanceLog>): Promise<MaintenanceLog> => {
    const response = await apiClient.put(API_ENDPOINTS.CARTS.MAINTENANCE.UPDATE(id), data);
    return response.data;
  },

  forceUnassign: async (rfidNumber: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.CARTS.FORCE_UNASSIGN(rfidNumber));
  },

  getFuelLogs: async (): Promise<FuelLog[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CARTS.FUEL_LOGS());
    return response.data;
  },

  getLapLogs: async (): Promise<LapLog[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CARTS.LAP_LOGS());
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CARTS.DELETE(id));
  },
  getMaintenanceLogs: () =>
    apiClient.get<MaintenanceLog[]>(`${API_ENDPOINTS.CARTS.MAINTENANCE.GET()}`)
      .then((response) => response.data),
  getCartMaintenanceLogs: (cartId: string) =>
    apiClient.get<MaintenanceLog[]>(`${API_ENDPOINTS.CARTS.MAINTENANCE.GET(cartId)}`).then((response) => response.data),

  getAssignmentHistory: async (
    cartId: string, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<AssignmentHistoryResponse> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.CARTS.ASSIGNMENT_HISTORY(cartId)}?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },
}; 