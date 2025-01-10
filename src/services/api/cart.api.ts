import { Cart, FuelLog, LapLog, MaintenanceLog } from 'src/types/cart';
import { apiClient } from './api-client';
import { AssignCartData, CartQueryParams, CartResponse, RefuelData } from './api.types';
import { API_ENDPOINTS } from './endpoints';

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
      pageSize: params.pageSize?.toString() || '100',
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

  // getFuelLogs: async (): Promise<FuelLog[]> => {
  //   const response = await apiClient.get(API_ENDPOINTS.CARTS.FUEL_LOGS());
  //   return response.data;
  // },

  getFuelLogs: async (params: any): Promise<any> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
    });
    const response = await apiClient.get(`${API_ENDPOINTS.CARTS.FUEL_LOGS()}?${searchParams}`);
    return response.data;
  },


  getLapLogs: async (): Promise<LapLog[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CARTS.LAP_LOGS());
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CARTS.DELETE(id));
  },
  // getMaintenanceLogs: () =>
  //   apiClient.get<any>(`${API_ENDPOINTS.CARTS.MAINTENANCE.GET()}`)
  //     .then((response) => response.data),

  getMaintenanceLogs: async (params: any): Promise<any> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
    });
    const response = await apiClient.get(`${API_ENDPOINTS.CARTS.MAINTENANCE.GET()}?${searchParams}`);
    return response.data;
  },



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