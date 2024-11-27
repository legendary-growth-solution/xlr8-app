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
  CartNumber: number;
  assignedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  users: User[];
  CartAssignments: CartAssignment[];
  timeInMinutes: number;
  startTime?: Date;
  endTime?: Date;
}

export interface Session {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'cancelled';
  start_time: string;
  end_time?: string;
  currentParticipants: number;
  maxParticipants: number;
  created_at: string;
  totalParticipants?: number;
}
