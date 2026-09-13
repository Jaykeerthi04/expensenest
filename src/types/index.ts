// Type definitions for the ExpenseNest app

export type Category = 'Housing' | 'Food' | 'Travel' | 'Utilities' | 'Shopping' | 'Other';

export interface Expense {
  _id: string;
  amount: number;
  category: Category;
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTotal {
  category: Category;
  amount: number;
  color: string;
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export type Period = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';