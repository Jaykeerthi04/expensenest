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
    <div className="overflow-hidden rounded-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Notes</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => (
            <tr 
              key={expense.id} 
              className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
            >
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{formatDate(expense.date)}</td>
              <td className="px-6 py-4 text-sm">
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" 
                  style={{ 
                    backgroundColor: `${CATEGORY_COLORS[expense.category]}15`, 
                    color: CATEGORY_COLORS[expense.category] 
                  }}
                >
                  {expense.category}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                ₹{expense.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">
                {expense.notes || '-'}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-3">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(expense)}
                      className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      aria-label="Edit expense"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={18} />
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