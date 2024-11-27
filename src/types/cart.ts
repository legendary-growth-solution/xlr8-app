export interface Cart {
  id: string;
  name: string;
  status: 'available' | 'in-use' | 'maintenance' | 'refueling';
  fuelLevel: number;
  totalDistance: number;
  lastMaintenanceDate?: string;
  lastRefuelDate?: string;
  currentSession?: string;
  currentUser?: string;
  model?: string;
  maxFuelCapacity?: number;
  fuelEfficiency?: number;
  rfidTag: string;
}

export interface FuelLog {
  id: string;
  cartId: string;
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