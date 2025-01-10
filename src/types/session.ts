import { GroupUserMapping } from './mappings';

export interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  created_at: string;
  status: string;
}

export interface CartAssignment {
  userId: string;
  cartNumber?: number;
  cartId?: string;
  assignedAt: Date | string;
  current_user?: string;
  rfid_number?: string;
  assigned_to?: string;
}

export interface Group {
  id: string;
  name: string;
  users: GroupUserMappingWithUser[];
  timeInMinutes?: number;
  cartAssignments: CartAssignment[];
  startTime?: Date;
  endTime?: Date;
  isBillGenerated: any;
}

export interface GroupUserMappingWithUser extends GroupUserMapping {
  user: User;
}

export interface Session {
  id: string;
  session_name: string;
  status: 'active' | 'completed' | 'cancelled';
  raceStatus: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
  end_time?: string;
  race_start_time?: string;
  race_end_time?: string;
  current_participants: number;
  max_participants: number;
  created_at: string;
  race_duration_minutes?: number;
  laps?: number;
  groups?: Group[];
}

export interface CreateSessionData {
  name?: string;
  max_participants?: number;
}
