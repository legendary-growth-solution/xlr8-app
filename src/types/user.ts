export interface HighlightResult {
  fullyHighlighted: boolean;
  matchLevel: 'none' | 'partial' | 'full';
  matchedWords: string[];
  value: string;
}

export interface HighlightResults {
  email?: HighlightResult;
  name?: HighlightResult;
  phone?: HighlightResult;
}

export interface User {
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  country_code?: string;
  full_phone?: string;
  user_id: string;
  phone: string;
  dob?: string;
  race_active?: boolean;
  total_active_seconds?: number;
  highlight_result?: HighlightResults;
}
