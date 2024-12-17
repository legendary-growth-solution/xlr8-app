import { Plan, DiscountCode, BillingDetails } from 'src/types/billing';
import { apiClient } from './api-client';
import { API_ENDPOINTS } from './endpoints';

export const billingApi = {
  getPlans: () => 
    apiClient.get<{ data: any }>(API_ENDPOINTS.billing.plans),

  getDiscountCodes: () => 
    apiClient.get<DiscountCode[]>(API_ENDPOINTS.billing.discountCodes),

  validateDiscountCode: (code: string) => 
    apiClient.post<{ valid: boolean; discount?: DiscountCode }>(API_ENDPOINTS.billing.validateDiscountCode, { code }),

  generateBill: (groupId: string, billingDetails: BillingDetails) => 
    apiClient.post<{ url: string }>(API_ENDPOINTS.billing.generateBill(groupId), billingDetails),

  createPlan: (data: Omit<any, 'id'>) => 
    apiClient.post<{ data: any }>(API_ENDPOINTS.billing.plans, data),

  updatePlan: (planId: string, data: Partial<Omit<any, 'id'>>) => 
    apiClient.put<{ data: any }>(`${API_ENDPOINTS.billing.plans}/${planId}`, data),

  deletePlan: (planId: string) => 
    apiClient.delete(`${API_ENDPOINTS.billing.plans}/${planId}`),
}; 
