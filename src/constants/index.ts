// Constants for the ExpenseNest app

import { Category, Budget } from '../types';

export const CATEGORY_COLORS: Record<Category, string> = {
  Housing: '#4f46e5', // Blue
  Food: '#4ade80',    // Green
  Travel: '#fb923c',  // Orange
  Utilities: '#f87171', // Red
  Shopping: '#a78bfa', // Purple
  Other: '#94a3b8',   // Gray
};

export const DEFAULT_EXPENSES = [
  {
    id: '1',
    amount: 900,
    category: 'Housing' as Category,
    date: '2025-01-15',
    notes: 'Monthly rent'
  },
  {
    id: '2',
    amount: 200,
    category: 'Food' as Category,
    date: '2025-01-20',
    notes: 'Grocery shopping'
  },
  {
    id: '3',
    amount: 150,
    category: 'Travel' as Category,
    date: '2025-01-25',
    notes: 'Uber rides'
  }
];

export const DEFAULT_BUDGETS: Budget[] = [
  { category: 'Housing', limit: 1000, spent: 900 },
  { category: 'Food', limit: 300, spent: 200 },
  { category: 'Travel', limit: 200, spent: 150 },
  { category: 'Utilities', limit: 150, spent: 0 },
  { category: 'Shopping', limit: 200, spent: 0 },
  { category: 'Other', limit: 100, spent: 0 }
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ANIMATION_DURATION = 300; // ms