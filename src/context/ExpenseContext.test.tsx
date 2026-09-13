import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ExpenseProvider, useExpenses } from '../context/ExpenseContext';
import React from 'react';

// Mock the config
vi.mock('../config', () => ({
  default: {
    API_URL: 'http://localhost:5000'
  }
}));

// Component to test the hook
const TestComponent = () => {
  const { expenses, addExpense, deleteExpense, isLoading } = useExpenses();
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="expense-count">{expenses.length}</div>
      {expenses.map(exp => (
        <div key={exp._id} data-testid={`expense-${exp._id}`}>
          {exp.amount} - {exp.category}
          <button onClick={() => deleteExpense(exp._id)}>Delete</button>
        </div>
      ))}
      <button
        onClick={() => {
          addExpense({
            amount: 100,
            category: 'Food',
            date: '2024-09-14',
            notes: 'Test'
          });
        }}
      >
        Add Expense
      </button>
      <button
        onClick={() => {
          addExpense({
            amount: -50,
            category: 'Food',
            date: '2024-09-14',
            notes: 'Invalid'
          });
        }}
      >
        Add Invalid Expense
      </button>
    </div>
  );
};

describe('ExpenseContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch expenses on mount and populate the list', async () => {
    const mockExpenses = [
      {
        _id: '1',
        amount: 100,
        category: 'Food',
        date: '2024-09-14',
        notes: 'Lunch'
      }
    ];

    localStorage.setItem('token', 'test-token');
    (global.fetch as unknown as jest.Mock<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockExpenses
    });

    render(
      <ExpenseProvider>
        <TestComponent />
      </ExpenseProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');

    // Wait for expenses to be fetched
    await waitFor(() => {
      expect(screen.getByTestId('expense-count')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/expenses',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
  });

  it('should handle no token on mount', async () => {
    localStorage.removeItem('token');

    render(
      <ExpenseProvider>
        <TestComponent />
      </ExpenseProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('expense-count')).toHaveTextContent('0');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should add an expense and update the list', async () => {
    const newExpense = {
      _id: 'new-123',
      amount: 100,
      category: 'Food',
      date: '2024-09-14',
      notes: 'Test'
    };

    localStorage.setItem('token', 'test-token');
    (global.fetch as unknown as jest.Mock<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newExpense
      });

    render(
      <ExpenseProvider>
        <TestComponent />
      </ExpenseProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    const addButton = screen.getByText('Add Expense');
    addButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('expense-count')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('expense-new-123')).toHaveTextContent('100 - Food');
  });

  it('should reject adding expense with negative amount before API call', async () => {
    localStorage.setItem('token', 'test-token');
    (global.fetch as unknown as jest.Mock<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(
      <ExpenseProvider>
        <TestComponent />
      </ExpenseProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    const invalidButton = screen.getByText('Add Invalid Expense');
    invalidButton.click();

    // Wait a bit to see if anything happens
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should still have 0 expenses (validation failed before API call)
    expect(screen.getByTestId('expense-count')).toHaveTextContent('0');

    // Should have been called only once (for initial fetch)
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should delete an expense', async () => {
    const mockExpenses = [
      {
        _id: '1',
        amount: 100,
        category: 'Food',
        date: '2024-09-14',
        notes: 'Lunch'
      }
    ];

    localStorage.setItem('token', 'test-token');
    (global.fetch as unknown as jest.Mock<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockExpenses
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted' })
      });

    render(
      <ExpenseProvider>
        <TestComponent />
      </ExpenseProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('expense-count')).toHaveTextContent('1');
    });

    const deleteButton = screen.getByText('Delete');
    deleteButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('expense-count')).toHaveTextContent('0');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/expenses/1',
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });

  it('should handle API error on fetch without corrupting state', async () => {
    localStorage.setItem('token', 'test-token');
    (global.fetch as unknown as jest.Mock<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' })
    });

    render(
      <ExpenseProvider>
        <TestComponent />
      </ExpenseProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Should have empty list when fetch fails
    expect(screen.getByTestId('expense-count')).toHaveTextContent('0');
  });

  it('should handle network error on fetch', async () => {
    localStorage.setItem('token', 'test-token');
    (global.fetch as unknown as jest.Mock<typeof fetch>).mockRejectedValueOnce(new Error('Network error'));

    render(
      <ExpenseProvider>
        <TestComponent />
      </ExpenseProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Should have empty list on network error
    expect(screen.getByTestId('expense-count')).toHaveTextContent('0');
  });
});
