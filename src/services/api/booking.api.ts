import { Booking, BookingConvertResponse } from 'src/types/booking';
import { API_ENDPOINTS } from './endpoints';
import { apiClient } from './api-client';

interface BookingListResponse {
  bookings: Booking[];
  totalCount: number;
}

interface BulkDeleteResponse {
  message: string;
  deleted_count: number;
  errors?: string[];
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
  status?: 'default' | 'paid' | 'failed' | 'paid_not_completed' | 'completed' | 'all';
}

export const bookingApi = {
  list: async (params?: PaginationParams): Promise<BookingListResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.LIST, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get(API_ENDPOINTS.BOOKINGS.DETAIL(id));
    return response.data;
  },

  update: async (id: string, data: Partial<Booking>): Promise<Booking> => {
    const response = await apiClient.put(API_ENDPOINTS.BOOKINGS.UPDATE(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BOOKINGS.DELETE(id));
  },

  convert: async (id: string): Promise<BookingConvertResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.CONVERT(id));
    return response.data;
  },

  bulkConvert: async (bookingIds: string[]): Promise<BookingConvertResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.BULK_CONVERT, { booking_ids: bookingIds });
    return response.data;
  },

  bulkDelete: async (bookingIds: string[]): Promise<BulkDeleteResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.BULK_DELETE, { booking_ids: bookingIds });
    return response.data;
  },

  create: async (data: Partial<Booking>): Promise<Booking> => {
    const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.LIST, data);
    return response.data;
  },
}; 