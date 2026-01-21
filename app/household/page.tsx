'use client';

import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useTransactions } from '@/app/hooks/useTransactions';
import {
  filterTransactionsByMonth,
  calculateBalance,
  calculateTotalIncome,
  calculateTotalExpense,
  getCategoryStats,
  formatCurrency,
  formatDate,
  getAvailableMonths,
  getCurrentMonth,
} from '@/app/utils/household';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
} from '@/app/constants/household';
import type { Transaction, TransactionType, Category } from '@/app/types/household';

export default function HouseholdPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, isLoaded } =
    useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [editingId, setEditingId] = useState<string | null>(null);

  // New transaction form state
  const [newType, setNewType] = useState<TransactionType>('expense');
  const [newCategory, setNewCategory] = useState<Category>('食費');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(getCurrentMonth() + '-01');
  const [newDescription, setNewDescription] = useState('');

  const monthlyTransactions = filterTransactionsByMonth(transactions, selectedMonth);
  const totalBalance = calculateBalance(transactions);
  const monthlyIncome = calculateTotalIncome(monthlyTransactions);
  const monthlyExpense = calculateTotalExpense(monthlyTransactions);
  const availableMonths = getAvailableMonths(transactions);

  if (!availableMonths.includes(selectedMonth) && availableMonths.length > 0) {
    setSelectedMonth(availableMonths[0]);
  }

  const handleAddTransaction = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('有効な金額を入力してください');
      return;
    }

    addTransaction({
      type: newType,
      category: newCategory,
      amount,
      date: newDate,
      description: newDescription,
    });

    setNewAmount('');
    setNewDescription('');
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('この取引を削除しますか？')) {
      deleteTransaction(id);
    }
  };

  const sortedTransactions = [...monthlyTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const incomeStats = getCategoryStats(monthlyTransactions, 'income');
  const expenseStats = getCategoryStats(monthlyTransactions, 'expense');

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8 px-4 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          家計簿アプリ
        </h1>

        <Tabs.Root defaultValue="overview" className="w-full">
          <Tabs.List className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md">
            <Tabs.Trigger
              value="overview"
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-100 dark:data-[state=inactive]:hover:bg-gray-700"
            >
              概要
            </Tabs.Trigger>
            <Tabs.Trigger
              value="history"
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-100 dark:data-[state=inactive]:hover:bg-gray-700"
            >
              履歴
            </Tabs.Trigger>
            <Tabs.Trigger
              value="breakdown"
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 dark:data-[state=inactive]:text-gray-300 data-[state=inactive]:hover:bg-gray-100 dark:data-[state=inactive]:hover:bg-gray-700"
            >
              内訳
            </Tabs.Trigger>
          </Tabs.List>

          {/* 概要タブ */}
          <Tabs.Content value="overview" className="space-y-6">
            {/* 残高カード */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                資産残高
              </h2>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalBalance)}
              </div>
            </div>

            {/* 月次統計カード */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedMonth}の収支
                </h2>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={getCurrentMonth()}>今月</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-sm text-green-800 dark:text-green-300 mb-1">
                    収入
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(monthlyIncome)}
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="text-sm text-red-800 dark:text-red-300 mb-1">支出</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(monthlyExpense)}
                  </div>
                </div>
              </div>
            </div>

            {/* 新規取引追加 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                新しい取引を追加
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      種類
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => {
                        setNewType(e.target.value as TransactionType);
                        setNewCategory(
                          e.target.value === 'income'
                            ? INCOME_CATEGORIES[0]
                            : EXPENSE_CATEGORIES[0]
                        );
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="expense">支出</option>
                      <option value="income">収入</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      カテゴリ
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Category)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {(newType === 'income'
                        ? INCOME_CATEGORIES
                        : EXPENSE_CATEGORIES
                      ).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      金額
                    </label>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="10000"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      日付
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    説明
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="例: スーパーで買い物"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleAddTransaction}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  追加
                </button>
              </div>
            </div>
          </Tabs.Content>

          {/* 履歴タブ */}
          <Tabs.Content value="history" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  取引履歴
                </h2>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={getCurrentMonth()}>今月</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {sortedTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  この月の取引はありません
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      isEditing={editingId === transaction.id}
                      onEdit={() => setEditingId(transaction.id)}
                      onCancelEdit={() => setEditingId(null)}
                      onSave={(updates) => {
                        updateTransaction(transaction.id, updates);
                        setEditingId(null);
                      }}
                      onDelete={() => handleDeleteTransaction(transaction.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tabs.Content>

          {/* 内訳タブ */}
          <Tabs.Content value="breakdown" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  月次内訳
                </h2>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={getCurrentMonth()}>今月</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 収入内訳 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    収入内訳
                  </h3>
                  {incomeStats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      収入データなし
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <PieChart stats={incomeStats} />
                      </div>
                      <div className="space-y-2">
                        {incomeStats.map((stat) => (
                          <div
                            key={stat.category}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: CATEGORY_COLORS[stat.category],
                                }}
                              />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {stat.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 dark:text-white">
                                {formatCurrency(stat.amount)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {stat.percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 支出内訳 */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    支出内訳
                  </h3>
                  {expenseStats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      支出データなし
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <PieChart stats={expenseStats} />
                      </div>
                      <div className="space-y-2">
                        {expenseStats.map((stat) => (
                          <div
                            key={stat.category}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: CATEGORY_COLORS[stat.category],
                                }}
                              />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {stat.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 dark:text-white">
                                {formatCurrency(stat.amount)}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {stat.percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

// Transaction Item Component
interface TransactionItemProps {
  transaction: Transaction;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updates: Partial<Transaction>) => void;
  onDelete: () => void;
}

function TransactionItem({
  transaction,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: TransactionItemProps) {
  const [editType, setEditType] = useState(transaction.type);
  const [editCategory, setEditCategory] = useState(transaction.category);
  const [editAmount, setEditAmount] = useState(transaction.amount.toString());
  const [editDate, setEditDate] = useState(transaction.date);
  const [editDescription, setEditDescription] = useState(transaction.description);

  const handleSave = () => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('有効な金額を入力してください');
      return;
    }

    onSave({
      type: editType,
      category: editCategory,
      amount,
      date: editDate,
      description: editDescription,
    });
  };

  if (isEditing) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <select
            value={editType}
            onChange={(e) => {
              setEditType(e.target.value as TransactionType);
              setEditCategory(
                e.target.value === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
              );
            }}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white text-sm"
          >
            <option value="expense">支出</option>
            <option value="income">収入</option>
          </select>
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value as Category)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white text-sm"
          >
            {(editType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white text-sm"
          />
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white text-sm"
          />
        </div>
        <input
          type="text"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
          >
            保存
          </button>
          <button
            onClick={onCancelEdit}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              transaction.type === 'income'
                ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {transaction.type === 'income' ? '収入' : '支出'}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {transaction.category}
          </span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {formatDate(transaction.date)}
          </span>
        </div>
        <div className="text-gray-700 dark:text-gray-300 text-sm">
          {transaction.description || '説明なし'}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div
          className={`text-xl font-bold ${
            transaction.type === 'income'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            編集
          </button>
          <button
            onClick={onDelete}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple Pie Chart Component
interface PieChartProps {
  stats: Array<{
    category: Category;
    amount: number;
    percentage: number;
  }>;
}

function PieChart({ stats }: PieChartProps) {
  let currentAngle = 0;
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const slices = stats.map((stat) => {
    const angle = (stat.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      path,
      color: CATEGORY_COLORS[stat.category],
      category: stat.category,
    };
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-sm mx-auto">
      {slices.map((slice, index) => (
        <path key={index} d={slice.path} fill={slice.color} stroke="white" strokeWidth="2" />
      ))}
    </svg>
  );
}
