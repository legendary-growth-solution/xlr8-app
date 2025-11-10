import { Banner, BannerListResponse, BannerQueryParams } from 'src/types/banner';
import { apiClient } from './api-client';
import { API_ENDPOINTS } from './endpoints';

export const bannerApi = {
  list: async (params: BannerQueryParams): Promise<BannerListResponse> => {
    const searchParams = new URLSearchParams({
      page: params.page?.toString() || '1',
      pageSize: params.pageSize?.toString() || '10',
      ...(params.search && { search: params.search }),
    });

    const response = await apiClient.get(`${API_ENDPOINTS.BANNERS.LIST}?${searchParams}`);
    return response.data;
  },

  getById: async (id: string): Promise<Banner> => {
    const response = await apiClient.get(API_ENDPOINTS.BANNERS.DETAIL(id));
    return response.data;
  },

  create: async (data: Partial<Banner>): Promise<{ message: string; banner_id: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.BANNERS.CREATE, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Banner>): Promise<{ message: string }> => {
    const response = await apiClient.put(API_ENDPOINTS.BANNERS.UPDATE(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(API_ENDPOINTS.BANNERS.DELETE(id));
    return response.data;
  },
};
