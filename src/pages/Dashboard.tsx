import React, { useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryTotal } from '../types';
import { CATEGORY_COLORS } from '../constants';
import Card, { CardTitle, CardContent } from '../components/ui/Card';
import ExpenseChart from '../components/ExpenseChart';
import ExpenseList from '../components/ExpenseList';
import BudgetTracker from '../components/BudgetTracker';
import PeriodSelector from '../components/PeriodSelector';

const Dashboard: React.FC = () => {
  const { expenses, totalExpenses, budgets } = useExpenses();
  const [activeTab, setActiveTab] = useState<'expenses' | 'budgets'>('expenses');

  // Calculate category totals for the chart
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    expenses.forEach((expense) => {
      if (totals[expense.category]) {
        totals[expense.category] += expense.amount;
      } else {
        totals[expense.category] = expense.amount;
      }
    });
    
    const result: CategoryTotal[] = Object.keys(totals).map((category) => ({
      category: category as any,
      amount: totals[category],
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
    }));
    
    return result;
  }, [expenses]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Expenses Card */}
          <Card className="md:col-span-1">
            <CardContent>
              <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Summary</h2>
                <PeriodSelector />
                <div className="mt-4">
                  <p className="text-gray-500">Total Expenses</p>
                  <p className="text-4xl font-bold text-gray-900">
                    ${totalExpenses.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Card */}
          <Card className="md:col-span-1">
            <CardContent>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Expense Breakdown</h2>
              <ExpenseChart data={categoryTotals} />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('expenses')}
            >
              Recent Expenses
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'budgets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('budgets')}
            >
              Budget Tracker
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'expenses' ? (
            <Card>
              <CardTitle>Recent Expenses</CardTitle>
              <CardContent>
                <ExpenseList />
              </CardContent>
            </Card>
          ) : (
            <BudgetTracker budgets={budgets} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;