import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Card, { CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useExpenses } from '../context/ExpenseContext';
import { Budget, Category } from '../types';
import { CATEGORY_COLORS, DEFAULT_BUDGETS } from '../constants';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { budgets: contextBudgets, expenses, setBudgets: setContextBudgets, clearExpenses } = useExpenses();
  const [budgets, setBudgets] = useState<Budget[]>(contextBudgets);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleBudgetChange = (category: Category, limit: number) => {
    setBudgets(
      budgets.map((budget) =>
        budget.category === category ? { ...budget, limit } : budget
      )
    );
  };

  const handleSaveBudgets = () => {
    setContextBudgets(budgets);
    setSuccessMessage('Budget settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleClearAllData = () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      clearExpenses();
      setSuccessMessage('All data cleared successfully!');
      setShowConfirmation(false);
      setTimeout(() => {
        setSuccessMessage('');
        // Redirect to dashboard after clearing data
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error clearing data:', error);
      setSuccessMessage('Failed to clear data. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleExportData = () => {
    try {
      // Format the date in a readable way
      const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      // Format currency
      const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(amount);
      };

      // Format percentage
      const formatPercentage = (value: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(value);
      };

      // Calculate category totals and percentages
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categoryTotals = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<Category, number>);

      // Create the text content
      let textContent = 'ExpenseNest - Expense Report\n';
      textContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
      
      // Add expenses section
      textContent += 'EXPENSES\n';
      textContent += '===========================================\n';
      textContent += 'Date           Category      Amount       % of Total   Description\n';
      textContent += '-------------------------------------------------------------------\n';
      
      expenses.forEach(expense => {
        const date = formatDate(expense.date);
        const amount = formatAmount(expense.amount);
        const percentage = formatPercentage(expense.amount / totalExpenses);
        textContent += `${date.padEnd(15)}${expense.category.padEnd(14)}${amount.padEnd(13)}${percentage.padEnd(12)}${expense.notes}\n`;
      });

      // Add category breakdown section
      textContent += '\n\nEXPENSE BREAKDOWN BY CATEGORY\n';
      textContent += '===========================================\n';
      textContent += 'Category      Amount       % of Total   Budget Limit   % of Budget Used\n';
      textContent += '-------------------------------------------------------------------\n';
      
      Object.entries(categoryTotals).forEach(([category, total]) => {
        const budget = budgets.find(b => b.category === category);
        const amount = formatAmount(total);
        const percentage = formatPercentage(total / totalExpenses);
        const budgetLimit = budget ? formatAmount(budget.limit) : 'N/A';
        const budgetPercentage = budget 
          ? formatPercentage(total / budget.limit)
          : 'N/A';
        
        textContent += `${category.padEnd(14)}${amount.padEnd(13)}${percentage.padEnd(12)}${budgetLimit.padEnd(14)}${budgetPercentage}\n`;
      });

      // Add visual chart
      textContent += '\n\nVISUAL BREAKDOWN\n';
      textContent += '===========================================\n';
      Object.entries(categoryTotals).forEach(([category, total]) => {
        const percentage = total / totalExpenses;
        const barLength = Math.round(percentage * 40); // 40 characters max for the bar
        const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength);
        textContent += `${category.padEnd(14)}${bar} ${formatPercentage(percentage)}\n`;
      });

      // Add summary section
      const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
      
      textContent += '\n\nSUMMARY\n';
      textContent += '===========================================\n';
      textContent += `Total Expenses: ${formatAmount(totalExpenses)}\n`;
      textContent += `Total Budget: ${formatAmount(totalBudget)}\n`;
      textContent += `Remaining Budget: ${formatAmount(totalBudget - totalExpenses)}\n`;
      textContent += `Overall Budget Utilization: ${formatPercentage(totalExpenses / totalBudget)}\n`;

      // Create and download the file
      const dataBlob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `expensenest-report-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Report exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setSuccessMessage('Failed to export report. Please try again.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        // Here you would validate the data and update the context
        console.log('Imported data:', importedData);
        setSuccessMessage('Data imported successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Import error:', error);
        setSuccessMessage('Failed to import data. Please check the file format.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 mb-8">Manage your budgets, data, and account preferences</p>
          
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-800 rounded-lg flex items-center space-x-2"
            >
              <CheckCircle size={20} />
              <span className="font-medium">{successMessage}</span>
            </motion.div>
          )}

          {/* Budget Settings */}
          <Card className="rounded-2xl shadow-lg p-6 bg-white mb-6 hover:shadow-xl transition-all duration-200">
            <CardTitle className="font-bold text-lg mb-4">Budget Settings</CardTitle>
            <CardContent className="p-0">
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div key={budget.category} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-sm shadow-sm"
                        style={{ backgroundColor: CATEGORY_COLORS[budget.category] }}
                      />
                      <span className="font-medium text-gray-700 min-w-32">{budget.category}</span>
                    </div>
                    <div className="flex items-center space-x-2 w-40">
                      <span className="text-sm text-gray-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={budget.limit}
                        onChange={(e) => handleBudgetChange(
                          budget.category,
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Button
                  onClick={handleSaveBudgets}
                  variant="primary"
                  className="shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Save Budget Settings
                </Button>
              </motion.div>
            </CardContent>
          </Card>
          
          {/* Data Management */}
          <Card className="rounded-2xl shadow-lg p-6 bg-white mb-6 hover:shadow-xl transition-all duration-200">
            <CardTitle className="font-bold text-lg mb-4">Data Management</CardTitle>
            <CardContent className="p-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Export Data</h3>
                  <p className="text-sm text-gray-600 mb-4">Download your expense data and budget settings as a report.</p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleExportData}
                      variant="secondary"
                      className="transition-all duration-200"
                    >
                      Export to File
                    </Button>
                  </motion.div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Import Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Import previously exported expense data.
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium cursor-pointer hover:bg-blue-100 transition-colors duration-200">
                      Choose File
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Danger Zone */}
          <Card className="rounded-2xl shadow-lg p-6 bg-red-50 border-2 border-red-200 mb-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <CardTitle className="font-bold text-lg text-red-600">Danger Zone</CardTitle>
            </div>
            <CardContent className="p-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Clear All Data</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    <span className="font-semibold text-red-600">Warning:</span> This action cannot be undone. All your expenses and budget settings will be permanently deleted.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleClearAllData}
                      className={`transition-all duration-200 ${
                        showConfirmation
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                          : 'border-2 border-red-500 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {showConfirmation ? '⚠️ Click again to confirm' : 'Clear All Data'}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Account Settings */}
          <Card className="rounded-2xl shadow-lg p-6 bg-white hover:shadow-xl transition-all duration-200">
            <CardTitle className="font-bold text-lg mb-4">Account Settings</CardTitle>
            <CardContent className="p-0">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    defaultValue="User"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    defaultValue="user@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
                >
                  <Button
                    className="shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Save Account Settings
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;