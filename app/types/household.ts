export type TransactionType = 'income' | 'expense';

export type Category =
  | '給与'
  | '副業'
  | 'その他収入'
  | '食費'
  | '住宅'
  | '光熱費'
  | '通信費'
  | '交通費'
  | '娯楽'
  | '医療'
  | 'その他支出';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: Category;
  amount: number;
  date: string; // YYYY-MM-DD format
  description: string;
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
}

export interface CategoryStats {
  category: Category;
  amount: number;
  percentage: number;
}
