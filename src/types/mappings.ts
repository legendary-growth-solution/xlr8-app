import { Cart } from "./cart";

export interface SessionGroupMapping {
  id: string;
  sessionId: string;
  groupId: string;
  createdAt: string;
  status: 'active' | 'completed';
  startTime?: string;
  endTime?: string;
}

export interface GroupUserMapping {
  id: string;
  group_id: string;
  user_id: string;
  cart_id?: Cart['id'];
  allowed_duration?: number;
  time_in_minutes?: number;
  assigned_at?: Date;
  start_time?: Date;
  end_time?: Date;
  lap_count?: number;
  best_lap_time?: number;
  total_time?: number;
  race_status?: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  race_start_time?: Date;
  race_end_time?: Date;
}
