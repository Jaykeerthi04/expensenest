import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Category, Budget, Period } from '../types';
import { DEFAULT_EXPENSES, DEFAULT_BUDGETS } from '../constants';
import Toast from '../components/ui/Toast';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (expense: Expense) => void;
  clearExpenses: () => void;
  totalExpenses: number;
  selectedPeriod: Period;
  setSelectedPeriod: (period: Period) => void;
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
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
  // Load expenses from localStorage or use defaults
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const savedExpenses = localStorage.getItem('expenses');
      return savedExpenses ? JSON.parse(savedExpenses) : DEFAULT_EXPENSES;
    } catch (error) {
      console.error('Error loading expenses:', error);
      return DEFAULT_EXPENSES;
    }
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Monthly');
  const [toast, setToast] = useState<ToastMessage | null>(null);

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

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
      // Recalculate budget spent amounts when expenses change
      setBudgets(currentBudgets => calculateSpentAmounts(expenses, currentBudgets));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  }, [expenses]);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  }, [budgets]);

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

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };
    
    setExpenses(prevExpenses => [...prevExpenses, newExpense]);
    checkBudgetExceeded(newExpense);
  };

  const deleteExpense = (id: string) => {
    try {
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const clearExpenses = () => {
    setExpenses([]);
    setBudgets(DEFAULT_BUDGETS.map(budget => ({ ...budget, spent: 0 })));
    localStorage.removeItem('expenses');
    localStorage.removeItem('budgets');
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(currentExpenses => 
      currentExpenses.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
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