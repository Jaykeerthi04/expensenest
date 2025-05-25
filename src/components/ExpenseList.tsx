import React from 'react';
import { Expense } from '../types';
import { Trash2, Edit } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';
import { useExpenses } from '../context/ExpenseContext';

interface ExpenseListProps {
  onEdit?: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ onEdit }) => {
  const { expenses, deleteExpense } = useExpenses();
  
  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedExpenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No expenses yet. Add your first expense!
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Notes</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => (
            <tr 
              key={expense.id} 
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-700">{formatDate(expense.date)}</td>
              <td className="px-4 py-3 text-sm">
                <span 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                  style={{ 
                    backgroundColor: `${CATEGORY_COLORS[expense.category]}20`, 
                    color: CATEGORY_COLORS[expense.category] 
                  }}
                >
                  {expense.category}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                ${expense.amount.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-[200px]">
                {expense.notes || '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-gray-500 hover:text-blue-500 transition-colors"
                      aria-label="Edit expense"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;