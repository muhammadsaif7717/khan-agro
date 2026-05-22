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

export interface Note {
  id: string;
  title: string;
  description: string;
  category: "general" | "milk" | "feed" | "finance" | "todo";
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  quantity: number;
  updatedAt: string;
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
  notes?: Note[];
  assets?: Asset[];
  calcHistory?: string[];
}

export interface Credentials {
  username: string;
  password: string;
}
