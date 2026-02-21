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

  // Calculate month-over-month comparison
  const monthComparison = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthExpenses = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const previousMonthExpenses = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return expDate.getMonth() === prevMonth && expDate.getFullYear() === prevYear;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    if (previousMonthExpenses === 0) return null;
    
    const percentChange = ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
    return {
      percentChange,
      isIncrease: percentChange > 0
    };
  }, [expenses]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Expenses Card */}
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <h2 className="text-xl font-bold text-gray-900">Summary</h2>
                <PeriodSelector />
                <div className="mt-6">
                  <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
                  <p className="text-5xl font-bold text-gray-900 mt-2">
                    ₹{totalExpenses.toFixed(2)}
                  </p>
                  {monthComparison && (
                    <div className={`mt-3 text-sm font-medium flex items-center ${monthComparison.isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                      <span>{monthComparison.isIncrease ? '↑' : '↓'} {Math.abs(monthComparison.percentChange).toFixed(1)}%</span>
                      <span className="text-gray-500 ml-2">from last month</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Card */}
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Expense Breakdown</h2>
              <ExpenseChart data={categoryTotals} />
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress Bars */}
        {categoryTotals.length > 0 && (
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Category Progress</h2>
              <div className="space-y-6">
                {categoryTotals.map((item) => {
                  const percentage = (item.amount / totalExpenses) * 100;
                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-semibold text-gray-900">₹{item.amount.toFixed(2)}</span>
                          <span className="text-sm text-gray-500 w-8 text-right">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('expenses')}
            >
              Recent Expenses
            </button>
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
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
            <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
              <CardTitle className="font-bold text-lg px-6 pt-6">Recent Expenses</CardTitle>
              <CardContent className="p-6">
                <ExpenseList />
              </CardContent>
            </Card>
          ) : (
            <div className="hover:shadow-xl transition-all duration-200">
              <BudgetTracker budgets={budgets} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;