export interface FieldOption {
  key: string;
  label: string;
  icon: string;
}

export type ReportType = 'user' | 'finance' | 'discount' | 'utilization' | 'leaderboard';

export interface ChartSuiteItem {
  title: string;
  subheader: string;
  type: 'line' | 'bar' | 'area' | 'donut';
  series: any[];
  categories?: string[];
  labels?: string[];
  isDualAxis?: boolean;
  isHorizontal?: boolean;
  gridSpan?: number;
}

export const USER_FIELDS: FieldOption[] = [
  { key: 'name', label: 'Name', icon: 'solar:user-bold-duotone' },
  { key: 'phone', label: 'Phone', icon: 'solar:phone-bold-duotone' },
  { key: 'age', label: 'Age', icon: 'solar:calendar-bold-duotone' },
  { key: 'email', label: 'Email', icon: 'solar:letter-bold-duotone' },
  { key: 'total_visits', label: 'Total Visits', icon: 'solar:restart-bold-duotone' },
  { key: 'last_visit_date', label: 'Last Visited On', icon: 'solar:clock-circle-bold-duotone' },
  { key: 'total_spent', label: 'Total Spent (INR)', icon: 'solar:card-bold-duotone' },
  { key: 'total_discount_availed', label: 'Total Discount (INR)', icon: 'solar:ticket-bold-duotone' },
  { key: 'coupons_used', label: 'Coupons Used', icon: 'solar:tag-bold-duotone' },
  { key: 'first_visit_date', label: 'First Visit Date', icon: 'solar:star-bold-duotone' },
  { key: 'best_lap_time', label: 'Best Lap Time', icon: 'solar:stopwatch-bold-duotone' },
  { key: 'total_laps', label: 'Total Laps', icon: 'solar:flag-bold-duotone' },
];

export const FINANCE_FIELDS: FieldOption[] = [
  { key: 'date', label: 'Date', icon: 'solar:calendar-bold-duotone' },
  { key: 'time', label: 'Time', icon: 'solar:clock-circle-bold-duotone' },
  { key: 'session_name', label: 'Session Name', icon: 'solar:notes-bold-duotone' },
  { key: 'session_id', label: 'Session ID', icon: 'solar:hashtag-bold-duotone' },
  { key: 'cart_numbers', label: 'Cart Numbers', icon: 'solar:cart-bold-duotone' },
  { key: 'duration', label: 'Duration (min)', icon: 'solar:hourglass-bold-duotone' },
  { key: 'plan_names', label: 'Plan(s)', icon: 'solar:box-bold-duotone' },
  { key: 'discount_code', label: 'Discount Code', icon: 'solar:ticket-bold-duotone' },
  { key: 'discount_amount', label: 'Discount Amount', icon: 'solar:tag-price-bold-duotone' },
  { key: 'grand_total', label: 'Grand Total', icon: 'solar:wallet-bold-duotone' },
  { key: 'total_riders', label: 'Total Riders', icon: 'solar:users-group-rounded-bold-duotone' },
  { key: 'new_riders', label: 'New Riders', icon: 'solar:user-plus-bold-duotone' },
];

export const DISCOUNT_FIELDS: FieldOption[] = [
  { key: 'code', label: 'Discount Code', icon: 'solar:ticket-bold-duotone' },
  { key: 'redemptions', label: 'Total Redemptions', icon: 'solar:restart-bold-duotone' },
  { key: 'total_discount', label: 'Total Discount (INR)', icon: 'solar:tag-price-bold-duotone' },
  { key: 'gross_revenue', label: 'Gross Revenue (INR)', icon: 'solar:wallet-bold-duotone' },
  { key: 'avg_discount', label: 'Avg Discount / Group', icon: 'solar:card-bold-duotone' },
];

export const UTILIZATION_FIELDS: FieldOption[] = [
  { key: 'date', label: 'Date', icon: 'solar:calendar-bold-duotone' },
  { key: 'total_sessions', label: 'Total Sessions', icon: 'solar:clock-circle-bold-duotone' },
  { key: 'total_riders', label: 'Total Riders', icon: 'solar:users-group-rounded-bold-duotone' },
  { key: 'total_revenue', label: 'Total Revenue (INR)', icon: 'solar:wallet-bold-duotone' },
  { key: 'avg_duration_min', label: 'Avg Duration (min)', icon: 'solar:hourglass-bold-duotone' },
  { key: 'carts_used_count', label: 'Unique Carts Used', icon: 'solar:cart-bold-duotone' },
];

export const LEADERBOARD_FIELDS: FieldOption[] = [
  { key: 'rank', label: 'Rank', icon: 'solar:cup-star-bold-duotone' },
  { key: 'name', label: 'Name', icon: 'solar:user-bold-duotone' },
  { key: 'phone', label: 'Phone', icon: 'solar:phone-bold-duotone' },
  { key: 'best_lap_time', label: 'Best Lap Time (ms)', icon: 'solar:stopwatch-bold-duotone' },
  { key: 'total_laps', label: 'Total Laps', icon: 'solar:flag-bold-duotone' },
  { key: 'total_sessions', label: 'Total Visits', icon: 'solar:restart-bold-duotone' },
  { key: 'total_spent', label: 'Total Spent (INR)', icon: 'solar:card-bold-duotone' },
  { key: 'last_visit_date', label: 'Last Visited On', icon: 'solar:clock-circle-bold-duotone' },
];

export function parseCsv(csvString: string): { headers: string[]; rows: string[][] } {
  if (!csvString || !csvString.trim()) return { headers: [], rows: [] };
  const lines = csvString.trim().split('\n');
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine).filter((r) => r.length > 0 && r.some((c) => c !== ''));

  return { headers, rows };
}
