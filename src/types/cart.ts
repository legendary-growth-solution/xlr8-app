export interface Cart {
  id?: string;
  name: string;
  status?: 'available' | 'in-use' | 'maintenance' | 'refueling';
  fuelLevel?: number;
  totalDistance?: number;
  lastMaintenanceDate?: string;
  lastRefuelDate?: string;
  currentSession?: string;
  currentUser?: string;
  model?: string;
  maxFuelCapacity?: number;
  fuelEfficiency?: number;
  rfidTag: string;
  current_level?: number;
  rfid_number?: string;
  assigned_to?: string;
  current_user?: string;
  cart_number?: number;
  last_refuel_date?: string;
  total_distance?: number;
}

export interface FuelLog {
  id: string;
  cartId: string;
  cartName: string;
  date: string;
  amount: number;
  cost: number;
  operatorId: string;
  previousLevel: number;
  currentLevel: number;
}

export interface MaintenanceLog {
  id: string;
  cartId: string;
  date: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost: number;
  technicianId: string;
  nextMaintenanceDate: string;
} 

export interface LapLog {
  id: string;
  cartId: string;
  cartName: string;
  sessionId: string;
  lapNumber: number;
  lapTime: string;
  timestamp: string;
}
