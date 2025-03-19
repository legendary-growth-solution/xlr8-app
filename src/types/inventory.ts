export interface InventoryItem {
  id: string;
  name: string;
  is_car_part: boolean;
  quantity: number;
  avg_price?: number;
  category?: string;
  created_at: string;
  updated_at: string;
  low_stock_number: number;
}

export interface InventoryLog {
  id: string;
  item_id: string;
  quantity: number;
  operation: 'add' | 'remove';
  avg_price?: number;
  remarks?: string;
  cart_id?: string;
  created_at: string;
}

export interface InventoryItemsResponse {
  items: InventoryItem[];
  pagination: any;
}

export interface InventoryLogsResponse {
  logs: InventoryLog[];
  pagination: any;
}