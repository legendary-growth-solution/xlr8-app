export interface Plan {
  id: string;
  name: string;
  defaultTime: number;
  cost: number;
  isVisible: boolean;
  description?: string;
}

export interface DiscountCode {
  id: string;
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