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
  groupId: string;
  userId: string;
  cartId?: string;
  assignedAt?: string;
  status: 'active' | 'inactive';
  raceStatus: 'not_started' | 'in_progress' | 'completed';
  allowedDuration: number;
  startTime?: string;
  endTime?: string;
  lapCount?: number;
  bestLapTime?: number;
  totalTime?: number;
} 