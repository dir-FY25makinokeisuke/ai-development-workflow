import type { Category } from '@/app/types/household';

export const INCOME_CATEGORIES: Category[] = ['給与', '副業', 'その他収入'];

export const EXPENSE_CATEGORIES: Category[] = [
  '食費',
  '住宅',
  '光熱費',
  '通信費',
  '交通費',
  '娯楽',
  '医療',
  'その他支出',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  給与: '#3b82f6',
  副業: '#10b981',
  'その他収入': '#8b5cf6',
  食費: '#ef4444',
  住宅: '#f59e0b',
  光熱費: '#06b6d4',
  通信費: '#ec4899',
  交通費: '#14b8a6',
  娯楽: '#a855f7',
  医療: '#f97316',
  'その他支出': '#6b7280',
};
