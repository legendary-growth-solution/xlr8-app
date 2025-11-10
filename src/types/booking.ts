import { Group, Session } from './session';

export interface BookingUser {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  plan_id: string;
  plan_name?: string;
  plan_amount?: number;
  plan_time?: number;
  is_new?: boolean;
  time_in_minutes?: number;
}

export interface Booking {
  booking_id: string;
  date: string;
  time_slot: string;
  race_time: string;
  race_day: string;
  users: BookingUser[];
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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