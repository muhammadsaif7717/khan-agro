// ─── Shared Types ───────────────────────────────────────────────────────────

export interface RecordItem {
  text: string;
  amount: number;
  date: string;
}

export interface FarmData {
  income: RecordItem[];
  expense: RecordItem[];
  donation: RecordItem[];
  withdraw: RecordItem[];
  investment: RecordItem[];
}

export interface Credentials {
  username: string;
  password: string;
}
