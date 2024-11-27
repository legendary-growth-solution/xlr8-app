import { Cart, FuelLog, MaintenanceLog } from 'src/types/cart';
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
  sessionId?: string;
}

export interface RefuelData {
  amount: number;
  cost: number;
  operatorId: string;
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
