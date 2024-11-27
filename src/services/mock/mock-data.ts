import { Cart, FuelLog, MaintenanceLog } from 'src/types/cart';
import { Session, Group, User } from 'src/types/session';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Rahul Patel',
    email: 'rahul123@mailinator.com',
    phone: '+919876543210',
    createdAt: new Date('1996-01-01'),
  },
  {
    id: '2',
    name: 'Priya Singh',
    email: 'priya456@mailinator.com',
    phone: '+919876543211',
    createdAt: new Date('1996-01-02'),
  },
  {
    id: '3',
    name: 'Rajesh Kumar',
    email: 'rajesh789@mailinator.com',
    phone: '+919876543212',
    createdAt: new Date('1996-01-03'),
  },
  {
    id: '4',
    name: 'Neha Sharma',
    email: 'neha012@mailinator.com',
    phone: '+919876543213',
    createdAt: new Date('1996-01-04'),
  },
  {
    id: '5',
    name: 'Amit Jain',
    email: 'amit345@mailinator.com',
    phone: '+919876543214',
    createdAt: new Date('1996-01-05'),
  },
  {
    id: '6',
    name: 'Sonia Gupta',
    email: 'sonia678@mailinator.com',
    phone: '+919876543215',
    createdAt: new Date('1996-01-06'),
  },
  {
    id: '7',
    name: 'Vikram Mehta',
    email: 'vikram901@mailinator.com',
    phone: '+919876543216',
    createdAt: new Date('1996-01-07'),
  },
];

export const MOCK_GROUPS: Record<string, Group[]> = {
  'session-1': [
    {
      id: 'group-1',
      name: 'Group A',
      users: MOCK_USERS.slice(0, 4),
      CartAssignments: [
        { userId: '1', CartNumber: 1, assignedAt: new Date() },
        { userId: '2', CartNumber: 2, assignedAt: new Date() },
      ],
      timeInMinutes: 15,
      startTime: new Date('2024-03-15T10:00:00'),
      endTime: new Date('2024-03-15T10:15:00'),
    },
  ],
  'session-2': [],
};

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-1',
    name: 'Morning Race Session',
    status: 'active',
    start_time: '2024-03-15T10:00:00',
    currentParticipants: 4,
    maxParticipants: 44,
    created_at: '2024-03-15T09:45:00',
  },
  {
    id: 'session-2',
    name: 'Afternoon Race Session',
    status: 'active',
    start_time: '2024-03-15T14:00:00',
    currentParticipants: 0,
    maxParticipants: 30,
    created_at: '2024-03-15T13:45:00',
  },
  {
    id: 'session-3',
    name: 'Evening Race Session',
    status: 'completed',
    start_time: '2024-03-15T18:00:00',
    end_time: '2024-03-15T20:00:00',
    currentParticipants: 25,
    maxParticipants: 25,
    created_at: '2024-03-15T17:45:00',
    totalParticipants: 25,
  },
];

export const MOCK_CARTS: Cart[] = [
  {
    id: 'cart_001',
    name: 'Cart 1',
    status: 'available',
    fuelLevel: 85,
    totalDistance: 1250.5,
    lastMaintenanceDate: '2024-03-01',
    lastRefuelDate: '2024-03-10',
    model: 'XLR8-2024',
    maxFuelCapacity: 20,
    fuelEfficiency: 15,
    rfidTag: '1234567890',
  },
  {
    id: 'cart_002',
    name: 'Cart 2',
    status: 'in-use',
    fuelLevel: 45,
    totalDistance: 2100.8,
    lastMaintenanceDate: '2024-02-15',
    lastRefuelDate: '2024-03-08',
    currentSession: 'session_001',
    currentUser: 'user_001',
    model: 'XLR8-2024',
    maxFuelCapacity: 20,
    fuelEfficiency: 15,
    rfidTag: '1234567891',
  },
  {
    id: 'cart_003',
    name: 'Cart 3',
    status: 'maintenance',
    fuelLevel: 30,
    totalDistance: 3500.2,
    lastMaintenanceDate: '2024-03-12',
    lastRefuelDate: '2024-03-05',
    model: 'XLR8-2023',
    maxFuelCapacity: 18,
    fuelEfficiency: 12,
    rfidTag: '1234567892',
  },
  {
    id: 'cart_004',
    name: 'Cart 4',
    status: 'refueling',
    fuelLevel: 10,
    totalDistance: 1800.3,
    lastMaintenanceDate: '2024-02-28',
    lastRefuelDate: '2024-03-01',
    model: 'XLR8-2024',
    maxFuelCapacity: 20,
    fuelEfficiency: 15,
    rfidTag: '1234567893',
  },
];

export const MOCK_FUEL_LOGS: FuelLog[] = [
  {
    id: 'fuel_001',
    cartId: 'cart_001',
    date: '2024-03-10',
    amount: 15,
    cost: 45.5,
    operatorId: 'operator_001',
    previousLevel: 10,
    currentLevel: 85,
  },
  {
    id: 'fuel_002',
    cartId: 'cart_002',
    date: '2024-03-08',
    amount: 12,
    cost: 36.4,
    operatorId: 'operator_002',
    previousLevel: 15,
    currentLevel: 75,
  },
];

export const MOCK_MAINTENANCE_LOGS: MaintenanceLog[] = [];
