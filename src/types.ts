export type Category = 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other';

export interface Budget {
  category: Category;
  limit: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description: string;
}

export interface CategoryTotal {
  category: Category;
  amount: number;
  color: string;
} 