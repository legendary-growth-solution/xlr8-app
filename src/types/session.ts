export interface Session {
  active: boolean;
  end_time: string;
  groups: Group[];
  name: string;
  session_id: string;
  start_time: string;
}

export interface Group {
  group_id: string;
  name: string;
  users: User[];
}

export interface User {
  cart_id: string | null;
  plan_id: string;
  race_active: boolean;
  total_active_seconds: number;
  user_id: string;
  user_name: string;
  time_allotted: number;
  race_end_time: string;
  race_start_times: string[];
  race_pause_times: string[];
  total_remaining_seconds?: number;
  time_in_minutes?: number;
}

export interface Cart {
  active_status: boolean;
  available_status: boolean;
  amount: number;
  cart_id: string;
  cost: number;
  created_at: string; // Could be a Date if parsed
  date: string; // Could be a Date if parsed
  fuel: number;
  fuel_capacity: number;
  fuel_level: number;
  name: string;
  notes: string;
  operation: string;
  quantity: number;
  rfid_number: string;
  status: string;
  type: string;
  variant: string;
  is_assigned?: boolean;
}

export interface Plan {
  amount: number;
  created_at: string; // Could be a Date if parsed appropriately
  name?: string; // to remove later
  plan_id: string;
  timeInMinutes: number;
  title: string;
}

export interface BillingData {
  gstNumber?: string;
  remarks?: string;
  discountCode?: string;
  discountAmount: number;
  totalAmount: number;
  subtotal?: number;
}

export interface NewUser {
  user_id: string;
  user_name: string;
  plan_id: string;
  time_in_minutes?: number;
}

export interface UpdatingUser {
  plan_id: string;
  user_id: string;
  time_in_minutes?: number;
}

export type UserRaceStatus = 'pause' | 'end' | 'start';

export interface Leaderboard {
  rank: number;
  group_name: string;
  total_laps: number;
  best_lap_number: number;
  best_lap_time:  number;
  user_id: string;
  user_name: string;
}
