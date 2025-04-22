import { Group, Session } from './session';

export interface BookingUser {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  plan_id: string;
}

export interface Booking {
  booking_id: string;
  date: string;
  time_slot: string;
  users: BookingUser[];
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface BookingConvertResponse {
  success: boolean;
  message: string;
  session: Session;
  groups: Group[];
} 