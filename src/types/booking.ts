import { Group, Session } from './session';

export interface BookingUser {
  user_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  country_code?: string;
  full_phone?: string;
  age?: number;
  plan_id: string;
  plan_name?: string;
  plan_amount?: number;
  plan_time?: number;
  is_new?: boolean;
  time_in_minutes?: number;
  cart_type_requested?: string;
}

export interface Booking {
  booking_id: string;
  date: string;
  time_slot: string;
  race_time: string;
  race_time_display?: string;
  race_day: string;
  users: BookingUser[];
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'payment_initiated' | 'paid' | 'failed';
  source?: string;
  discount_code?: string;
  total?: number;
}

export interface BookingConvertResponse {
  success: boolean;
  message: string;
  session: Session;
  groups: Group[];
} 