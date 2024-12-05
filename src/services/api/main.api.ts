import { apiClient } from './api-client';
import { API_ENDPOINTS } from './endpoints';

export const mainApi = {
  validateCode: async (code: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VALIDATE_CODE, { code });
      return response.data;
    } catch (error) {
      throw new Error('Failed to validate code');
    }
  },
  
  generateHash: async (code: string, role?: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.GENERATE_HASH, { code, role });
      return response.data;
    } catch (error) {
      throw new Error('Failed to generate hash');
    }
  },
};
