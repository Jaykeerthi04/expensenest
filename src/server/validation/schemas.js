import { z } from 'zod';

// Register schema
export const registerSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .trim(),
  email: z.string()
    .min(1, 'Email is required')
    .email('Email must be a valid email address')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
});

// Login schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Email must be a valid email address')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
});

// Expense schema for creation and update
export const expenseSchema = z.object({
  amount: z.number()
    .min(0.01, 'Amount must be greater than 0')
    .refine(val => !isNaN(val), 'Amount must be a valid number'),
  category: z.string()
    .min(1, 'Category is required')
    .trim(),
  date: z.string()
    .min(1, 'Date is required')
    .refine(val => !isNaN(Date.parse(val)), 'Date must be a valid date'),
  notes: z.string()
    .optional()
    .default('')
});
