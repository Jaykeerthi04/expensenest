import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Category, Budget, Period } from '../types';
import { DEFAULT_EXPENSES, DEFAULT_BUDGETS } from '../constants';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (expense: Expense) => void;
  totalExpenses: number;
  selectedPeriod: Period;
  setSelectedPeriod: (period: Period) => void;
  budgets: Budget[];
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
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : DEFAULT_EXPENSES;
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Monthly');
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };
    
    setExpenses([...expenses, newExpense]);
    
    // Update budget spent amount for the category
    setBudgets(currentBudgets => 
      currentBudgets.map(budget => 
        budget.category === newExpense.category 
          ? { ...budget, spent: budget.spent + newExpense.amount } 
          : budget
      )
    );
  };

  const deleteExpense = (id: string) => {
    const expenseToDelete = expenses.find(expense => expense.id === id);
    if (!expenseToDelete) return;
    
    setExpenses(expenses.filter(expense => expense.id !== id));
    
    // Update budget spent amount for the category
    setBudgets(currentBudgets => 
      currentBudgets.map(budget => 
        budget.category === expenseToDelete.category 
          ? { ...budget, spent: budget.spent - expenseToDelete.amount } 
          : budget
      )
    );
  };

  const updateExpense = (updatedExpense: Expense) => {
    const oldExpense = expenses.find(e => e.id === updatedExpense.id);
    if (!oldExpense) return;
    
    setExpenses(expenses.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    ));
    
    // Update budget spent amounts if category or amount changed
    if (oldExpense.category !== updatedExpense.category || oldExpense.amount !== updatedExpense.amount) {
      setBudgets(currentBudgets => 
        currentBudgets.map(budget => {
          if (budget.category === oldExpense.category) {
            return { ...budget, spent: budget.spent - oldExpense.amount };
          } else if (budget.category === updatedExpense.category) {
            return { ...budget, spent: budget.spent + updatedExpense.amount };
          }
          return budget;
        })
      );
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <ExpenseContext.Provider value={{
      expenses,
      addExpense,
      deleteExpense,
      updateExpense,
      totalExpenses,
      selectedPeriod,
      setSelectedPeriod,
      budgets,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};