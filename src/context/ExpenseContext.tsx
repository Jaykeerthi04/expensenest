import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Category, Budget, Period } from '../types';
import { DEFAULT_BUDGETS } from '../constants';
import Toast from '../components/ui/Toast';
import config from '../config';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (expense: Omit<Expense, 'createdAt' | 'updatedAt'>) => void;
  clearExpenses: () => void;
  totalExpenses: number;
  selectedPeriod: Period;
  setSelectedPeriod: (period: Period) => void;
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  isLoading: boolean;
}

interface ToastMessage {
  message: string;
  type: 'success' | 'warning' | 'error';
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider = ({ children }: ExpenseProviderProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Monthly');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate spent amounts for each category based on current expenses
  const calculateSpentAmounts = (currentExpenses: Expense[], budgetLimits: Budget[]) => {
    const spentByCategory = {} as Record<Category, number>;
    
    // Initialize spent amounts to 0
    budgetLimits.forEach(budget => {
      spentByCategory[budget.category] = 0;
    });
    
    // Calculate total spent for each category
    currentExpenses.forEach(expense => {
      spentByCategory[expense.category] = (spentByCategory[expense.category] || 0) + expense.amount;
    });
    
    // Update budgets with calculated spent amounts
    return budgetLimits.map(budget => ({
      ...budget,
      spent: spentByCategory[budget.category] || 0
    }));
  };

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const savedBudgets = localStorage.getItem('budgets');
      const loadedBudgets = savedBudgets ? JSON.parse(savedBudgets) : DEFAULT_BUDGETS;
      
      // Calculate actual spent amounts based on current expenses
      return calculateSpentAmounts(expenses, loadedBudgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
      return calculateSpentAmounts(expenses, DEFAULT_BUDGETS);
    }
  });

  // Fetch expenses from backend on mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          // User not logged in, start with empty expenses
          setExpenses([]);
          return;
        }

        const response = await fetch(`${config.API_URL}/api/expenses`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            setExpenses([]);
            return;
          }
          throw new Error('Failed to fetch expenses');
        }

        const data = await response.json();
        // Convert date strings to ensure they're in the right format
        const formattedExpenses = data.map((exp: Expense) => ({
          ...exp,
          date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : ''
        }));
        setExpenses(formattedExpenses);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setToast({
          message: 'Failed to load expenses',
          type: 'error'
        });
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  }, [budgets]);

  // Recalculate budget spent amounts when expenses change
  useEffect(() => {
    setBudgets(currentBudgets => calculateSpentAmounts(expenses, currentBudgets));
  }, [expenses]);

  const checkBudgetExceeded = (newExpense: Expense) => {
    const budget = budgets.find(b => b.category === newExpense.category);
    if (budget) {
      const newSpent = budget.spent + newExpense.amount;
      if (newSpent > budget.limit) {
        setToast({
          message: `Budget exceeded for ${newExpense.category}! You are ₹${(newSpent - budget.limit).toFixed(2)} over the limit.`,
          type: 'error'
        });
      } else if (newSpent > budget.limit * 0.9) {
        setToast({
          message: `Warning: ${newExpense.category} budget is at ${((newSpent / budget.limit) * 100).toFixed(1)}%`,
          type: 'warning'
        });
      }
    }
  };

  const addExpense = async (expenseData: Omit<Expense, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Client-side validation before API call
      if (!expenseData.amount || expenseData.amount <= 0) {
        setToast({
          message: 'Amount must be greater than 0',
          type: 'error'
        });
        return;
      }

      if (!expenseData.category || expenseData.category.trim() === '') {
        setToast({
          message: 'Category is required',
          type: 'error'
        });
        return;
      }

      if (!expenseData.date || expenseData.date.trim() === '') {
        setToast({
          message: 'Date is required',
          type: 'error'
        });
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          message: 'Please log in to add expenses',
          type: 'error'
        });
        return;
      }

      const response = await fetch(`${config.API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add expense');
      }

      const newExpense = await response.json();
      // Format the date from the server response
      const formattedExpense = {
        ...newExpense,
        date: newExpense.date ? new Date(newExpense.date).toISOString().split('T')[0] : ''
      };
      
      setExpenses(prevExpenses => [...prevExpenses, formattedExpense]);
      checkBudgetExceeded(formattedExpense);
      setToast({
        message: 'Expense added successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to add expense',
        type: 'error'
      });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          message: 'Please log in to delete expenses',
          type: 'error'
        });
        return;
      }

      const response = await fetch(`${config.API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete expense');
      }

      setExpenses(prevExpenses => prevExpenses.filter(expense => expense._id !== id));
      setToast({
        message: 'Expense deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to delete expense',
        type: 'error'
      });
    }
  };

  const clearExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Delete all user's expenses
      const expenseIds = expenses.map(exp => exp._id);
      for (const id of expenseIds) {
        await fetch(`${config.API_URL}/api/expenses/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      setExpenses([]);
      setBudgets(DEFAULT_BUDGETS.map(budget => ({ ...budget, spent: 0 })));
      localStorage.removeItem('budgets');
    } catch (error) {
      console.error('Error clearing expenses:', error);
    }
  };

  const updateExpense = async (updatedExpense: Omit<Expense, 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          message: 'Please log in to update expenses',
          type: 'error'
        });
        return;
      }

      const response = await fetch(`${config.API_URL}/api/expenses/${updatedExpense._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedExpense)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update expense');
      }

      const serverExpense = await response.json();
      // Format the date from the server response
      const formattedExpense = {
        ...serverExpense,
        date: serverExpense.date ? new Date(serverExpense.date).toISOString().split('T')[0] : ''
      };

      setExpenses(currentExpenses => 
        currentExpenses.map(expense => 
          expense._id === formattedExpense._id ? formattedExpense : expense
        )
      );
      setToast({
        message: 'Expense updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to update expense',
        type: 'error'
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <ExpenseContext.Provider value={{
      expenses,
      addExpense,
      deleteExpense,
      updateExpense,
      clearExpenses,
      totalExpenses,
      selectedPeriod,
      setSelectedPeriod,
      budgets,
      setBudgets,
      isLoading,
    }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ExpenseContext.Provider>
  );
};