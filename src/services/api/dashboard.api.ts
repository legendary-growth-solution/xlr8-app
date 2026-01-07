import { apiClient } from './api-client';

export interface DashboardStats {
  today: { amount: number; rides: number };
  yesterday: { amount: number; rides: number };
  last7Days: { amount: number; rides: number };
  totals: { amount: number; rides: number };
  last7DaysData?: Array<{ date: string; amount: number; rides: number }>;
  cartStats?: {
    byId: Record<string, number>;
    byType: Record<string, number>;
  };
}

export interface DailyCartData {
  cart_stats_by_date?: Record<string, {
    cart_by_id_count?: Record<string, number>;
    cart_by_type_count?: Record<string, number>;
  }>;
  cart_id_to_rfid?: Record<string, string>;
}

export const dashboardApi = {
  getDashboardStats: async (timezone?: string): Promise<DashboardStats> => {
    const searchParams = new URLSearchParams();
    if (timezone) {
      searchParams.set('timezone', timezone);
    }
    const response = await apiClient.get(`/dashboard-stats?${searchParams.toString()}`);
    return response.data;
  },

  getCartStats: async (startDate: string, endDate: string): Promise<DailyCartData> => {
    const response = await apiClient.get(`/cart-stats?startDate=${startDate}&endDate=${endDate}`);
    return response.data || { cart_stats_by_date: {}, cart_id_to_rfid: {} };
  },
};

