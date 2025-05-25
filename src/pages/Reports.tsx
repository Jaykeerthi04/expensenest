import React, { useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryTotal, Category } from '../types';
import { CATEGORY_COLORS, MONTHS } from '../constants';
import Card, { CardTitle, CardContent } from '../components/ui/Card';
import Select from '../components/ui/Select';
import ExpenseChart from '../components/ExpenseChart';

const Reports: React.FC = () => {
  const { expenses } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  // Generate month options
  const monthOptions = MONTHS.map((month, index) => ({
    value: index.toString(),
    label: month
  }));

  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear].map(year => ({
    value: year.toString(),
    label: year.toString()
  }));

  // Generate category options
  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    ...Object.keys(CATEGORY_COLORS).map(category => ({
      value: category,
      label: category
    }))
  ];

  // Filter expenses by selected month, year, and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const monthMatch = expenseDate.getMonth() === selectedMonth;
      const yearMatch = expenseDate.getFullYear() === selectedYear;
      const categoryMatch = selectedCategory === 'All' || expense.category === selectedCategory;
      
      return monthMatch && yearMatch && categoryMatch;
    });
  }, [expenses, selectedMonth, selectedYear, selectedCategory]);

  // Calculate total amount for filtered expenses
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  // Calculate category totals for the chart
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    filteredExpenses.forEach((expense) => {
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
  }, [filteredExpenses]);

  // Calculate day-by-day spending for the selected month
  const dailySpending = useMemo(() => {
    const days: Record<number, number> = {};
    
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const day = expenseDate.getDate();
      
      if (days[day]) {
        days[day] += expense.amount;
      } else {
        days[day] = expense.amount;
      }
    });
    
    return days;
  }, [filteredExpenses]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Expense Reports</h1>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardTitle>Filters</CardTitle>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Month"
              options={monthOptions}
              value={selectedMonth.toString()}
              onChange={(value) => setSelectedMonth(parseInt(value))}
            />
            
            <Select
              label="Year"
              options={yearOptions}
              value={selectedYear.toString()}
              onChange={(value) => setSelectedYear(parseInt(value))}
            />
            
            <Select
              label="Category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value as Category | 'All')}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Total Card */}
        <Card>
          <CardTitle>Monthly Summary</CardTitle>
          <CardContent>
            <div className="mt-2">
              <p className="text-gray-500">
                Total Expenses for {MONTHS[selectedMonth]} {selectedYear}
                {selectedCategory !== 'All' && ` (${selectedCategory})`}
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-1">
                ${totalAmount.toFixed(2)}
              </p>
              
              {filteredExpenses.length > 0 ? (
                <p className="text-sm text-gray-500 mt-2">
                  {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} recorded
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  No expenses recorded for this period
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Chart Card */}
        <Card>
          <CardTitle>Category Breakdown</CardTitle>
          <CardContent>
            {categoryTotals.length > 0 ? (
              <ExpenseChart data={categoryTotals} />
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-500">
                No data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Daily Spending Card */}
      <Card>
        <CardTitle>Daily Spending</CardTitle>
        <CardContent>
          {Object.keys(dailySpending).length > 0 ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(dailySpending)
                .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
                .map(([day, amount]) => (
                  <div key={day} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="font-medium">
                      {MONTHS[selectedMonth]} {day}, {selectedYear}
                    </span>
                    <span className="font-semibold">${amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No daily spending data available for this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;