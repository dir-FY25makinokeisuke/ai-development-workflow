import type { Transaction, CategoryStats } from '@/app/types/household';

export function getMonthKey(date: string): string {
  return date.substring(0, 7); // YYYY-MM
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  month: string
): Transaction[] {
  return transactions.filter((t) => getMonthKey(t.date) === month);
}

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateTotalExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateBalance(transactions: Transaction[]): number {
  return calculateTotalIncome(transactions) - calculateTotalExpense(transactions);
}

export function getCategoryStats(
  transactions: Transaction[],
  type: 'income' | 'expense'
): CategoryStats[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, number>();
  filtered.forEach((t) => {
    const current = categoryMap.get(t.category) || 0;
    categoryMap.set(t.category, current + t.amount);
  });

  const stats: CategoryStats[] = Array.from(categoryMap.entries()).map(
    ([category, amount]) => ({
      category: category as CategoryStats['category'],
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    })
  );

  return stats.sort((a, b) => b.amount - a.amount);
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getAvailableMonths(transactions: Transaction[]): string[] {
  const months = new Set(transactions.map((t) => getMonthKey(t.date)));
  return Array.from(months).sort().reverse();
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
