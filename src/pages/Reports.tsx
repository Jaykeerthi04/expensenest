import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingDown } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryTotal, Category } from '../types';
import { CATEGORY_COLORS, MONTHS } from '../constants';
import Card, { CardTitle, CardContent } from '../components/ui/Card';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Expense Reports</h1>
          <p className="text-gray-600 mb-8">Analyze your spending patterns and trends</p>
          
          {/* Filters */}
          <Card className="rounded-2xl shadow-lg p-6 bg-white mb-8 hover:shadow-xl transition-all duration-200">
            <CardTitle className="font-bold text-lg mb-4">Filters</CardTitle>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={selectedMonth.toString()}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\3e%3cpolyline points=\"6 9 12 15 18 9\"\3e%3c/polyline\3e%3c/svg%3e")' ,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.7rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    {monthOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedYear.toString()}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\3e%3cpolyline points=\"6 9 12 15 18 9\"\3e%3c/polyline\3e%3c/svg%3e")' ,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.7rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    {yearOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\3e%3cpolyline points=\"6 9 12 15 18 9\"\3e%3c/polyline\3e%3c/svg%3e")' ,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.7rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Card className="rounded-2xl shadow-lg p-6 bg-white hover:shadow-xl transition-all duration-200 h-full">
                <CardTitle className="font-bold text-lg mb-6 flex items-center space-x-2">
                  <TrendingDown size={20} className="text-blue-600" />
                  <span>Monthly Summary</span>
                </CardTitle>
                <CardContent className="p-0">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Total Expenses for {MONTHS[selectedMonth]} {selectedYear}
                    {selectedCategory !== 'All' && ` (${selectedCategory})`}
                  </p>
                  <p className="text-6xl font-bold text-gray-900 mb-4">
                    ₹{totalAmount.toFixed(2)}
                  </p>
                  
                  {filteredExpenses.length > 0 ? (
                    <p className="text-sm font-medium text-gray-600">
                      {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} recorded
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No expenses recorded for this period
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Card className="rounded-2xl shadow-lg p-6 bg-white hover:shadow-xl transition-all duration-200 h-full">
                <CardTitle className="font-bold text-lg mb-4 flex items-center space-x-2">
                  <PieChart size={20} className="text-purple-600" />
                  <span>Category Breakdown</span>
                </CardTitle>
                <CardContent className="p-0">
                  {categoryTotals.length > 0 ? (
                    <ExpenseChart data={categoryTotals} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-80 text-gray-400">
                      <PieChart size={48} className="mb-3 opacity-30" />
                      <p className="text-base font-medium">No data available</p>
                      <p className="text-sm mt-1">for the selected period</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Daily Spending Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card className="rounded-2xl shadow-lg p-6 bg-white hover:shadow-xl transition-all duration-200">
              <CardTitle className="font-bold text-lg mb-4">Daily Spending</CardTitle>
              <CardContent className="p-0">
                {Object.keys(dailySpending).length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(dailySpending)
                      .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
                      .map(([day, amount]) => (
                        <div key={day} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-all duration-200">
                          <span className="font-medium text-gray-700">
                            {MONTHS[selectedMonth]} {day}
                          </span>
                          <span className="font-bold text-gray-900">₹{amount.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <TrendingDown size={48} className="mb-3 opacity-30" />
                    <p className="text-base font-medium">No daily spending data</p>
                    <p className="text-sm mt-1">available for this period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
};