import { Cart } from 'src/types/cart';
import { Session, User } from 'src/types/session';

export interface CartResponse {
  carts: Cart[];
  total: number;
}

export interface CartQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: Cart['status'];
}

export interface AssignCartData {
  userId: string;
  groupUserMappingId: string;
  sessionId?: string;
}

export interface RefuelData {
  amount: number;
  cost: number;
  notes?: string;
}

export interface SessionResponse {
  sessions: Session[];
  total: number;
}

export interface SessionQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface UserResponse {
  users: User[];
  total: number;
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}


export interface GroupUserMappingData {
  user_id: string;
  time_in_minutes: number;
  cart_id?: string;
}


export interface CartAssignmentData {
  user_id: string;
  cart_id: string;
  status?: 'assigned' | 'unassigned';
  assigned_to?: string;
}
