export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  timeInMinutes?: number;
}

export interface CartAssignment {
  userId: string;
  cartNumber: number;
  cartId?: string;
  assignedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  users: User[];
  cartAssignments: CartAssignment[];
  timeInMinutes: number;
  startTime?: Date;
  endTime?: Date;
}

export interface Session {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'cancelled';
  raceStatus: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
  end_time?: string;
  race_start_time?: string;
  race_end_time?: string;
  currentParticipants: number;
  maxParticipants: number;
  created_at: string;
  totalParticipants?: number;
  race_duration_minutes?: number;
  laps?: number;
  groups?: Group[];
}
