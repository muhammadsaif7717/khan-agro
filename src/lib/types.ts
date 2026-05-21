// ─── Shared Types ───────────────────────────────────────────────────────────

export interface RecordItem {
  text: string;
  amount: number;
  date: string;
  category?: string;
}

export interface SavedTotalItem {
  amount: number;
  date: string;
  note: string;
}

export interface FarmData {
  income: RecordItem[];
  expense: RecordItem[];
  donation: RecordItem[];
  withdraw: RecordItem[];
  investment: RecordItem[];
  reinvestment: RecordItem[];
  returnedCash: RecordItem[];
  savedTotals?: Record<string, SavedTotalItem[]>;
}

export interface Credentials {
  username: string;
  password: string;
}
