export type Category = 'Housing' | 'Food' | 'Travel' | 'Utilities' | 'Shopping' | 'Other';
export type Period = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  notes: string;
}

export interface CategoryTotal {
  category: Category;
  amount: number;
  color: string;
} 