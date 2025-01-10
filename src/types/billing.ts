export interface Plan {
  id: string;
  plan_id: string;
  amount: number;
  created_at: string;
  title: string;
  timeInMinutes: number;
  name: string;
  defaultTime: number;
  cost: number;
  isVisible: boolean;
  description?: string;
}

export interface DiscountCode {
  discount_id: string;
  code: string;
  description: string;
  type: 'absolute' | 'percent';
  value: number;
  status: 'active' | 'inactive';
}

export interface BillingDetails {
  gstNumber?: string;
  remarks?: string;
  discountCode?: string;
  plan: Plan;
}

export interface DiscountFormData {
  discount_id?: string;
  code: string;
  description: string;
  type: 'absolute' | 'percent';
  value: number;
  status: 'active' | 'inactive';
}

export const defaultDiscountData: DiscountFormData = {
  discount_id: '',
  code: '',
  description: '',
  type: 'absolute',
  value: 0,
  status: 'active',
};
