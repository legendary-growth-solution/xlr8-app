import type { DiscountCode, BillingDetails, BookingRules } from 'src/types/billing';

import { apiClient } from './api-client';
import { API_ENDPOINTS } from './endpoints';

export const billingApi = {
  getBookingRules: () => 
    apiClient.get<BookingRules>(API_ENDPOINTS.billing.bookingRules),

  updateBookingRules: (data: Partial<BookingRules>) => 
    apiClient.put<BookingRules>(API_ENDPOINTS.billing.bookingRules, data),

  getPlans: (params?: { date?: string; day?: string }) => 
    apiClient.get<{ plans: any[] }>(API_ENDPOINTS.billing.plans, { params }),

  getDiscountCodes: () => 
    apiClient.get(API_ENDPOINTS.billing.discountCodes),

  createDiscountCode: (data: Omit<DiscountCode, 'discount_id'>) => 
    apiClient.post<{ data: DiscountCode }>(API_ENDPOINTS.billing.discountCodes, data),

  updateDiscountCode: (codeId: string, data: Partial<Omit<DiscountCode, 'discount_id'>>) => 
    apiClient.put<{ data: DiscountCode }>(`${API_ENDPOINTS.billing.discountCodes}/${codeId}`, data),

  deleteDiscountCode: (codeId: string) => 
    apiClient.delete(`${API_ENDPOINTS.billing.discountCodes}/${codeId}`),

  validateDiscountCode: (code: string) => 
    apiClient.post<{ 
      valid: boolean;
      discount_amount?: number;
      discount_type?: 'absolute' | 'percentage' | 'percent';
      message?: string;
    }>(API_ENDPOINTS.billing.validateDiscountCode(), { code }),

  getBillingData: (sessionId: string, groupId: string) => 
    apiClient.get<{ data: any }>(API_ENDPOINTS.billing.getBillingData(sessionId, groupId)),

  getAllInvoices: () => 
    apiClient.get<{ data: any }>(API_ENDPOINTS.billing.allInvoices),

  generateBill: (sessionId: string, groupId: string, billingDetails: BillingDetails) => 
    apiClient.post<{ url: string }>(API_ENDPOINTS.billing.generateBill(sessionId, groupId), billingDetails),

  createPlan: (data: Omit<any, 'id'>) => 
    apiClient.post<{ data: any }>(API_ENDPOINTS.billing.plans, data),

  updatePlan: (planId: string, data: Partial<Omit<any, 'id'>>) => 
    apiClient.put<{ data: any }>(`${API_ENDPOINTS.billing.plans}/${planId}`, data),

  deletePlan: (planId: string) => 
    apiClient.delete(`${API_ENDPOINTS.billing.plans}/${planId}`),

  generateInvoice: (sessionId: string, groupId: string, billingDetails: any) => 
    apiClient.post(
      API_ENDPOINTS.billing.generateBill(sessionId, groupId), 
      billingDetails,
      {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      }
    ),

  deleteBill: (sessionId: string, groupId: string) => 
    apiClient.delete(API_ENDPOINTS.billing.deleteBill(sessionId, groupId)),
}; 
