import React, { useState } from 'react';
import Card, { CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useExpenses } from '../context/ExpenseContext';
import { Budget, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';

const Settings: React.FC = () => {
  const { budgets: contextBudgets, expenses } = useExpenses();
  const [budgets, setBudgets] = useState<Budget[]>(contextBudgets);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleBudgetChange = (category: Category, limit: number) => {
    setBudgets(
      budgets.map((budget) =>
        budget.category === category ? { ...budget, limit } : budget
      )
    );
  };

  const handleSaveBudgets = () => {
    // In a real app, this would save to the context and backend
    setSuccessMessage('Budget settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
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
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
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
        textContent += `${date.padEnd(15)}${expense.category.padEnd(14)}${amount.padEnd(13)}${percentage.padEnd(12)}${expense.description}\n`;
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      {/* Budget Settings */}
      <Card className="mb-6">
        <CardTitle>Budget Settings</CardTitle>
        <CardContent>
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
              {successMessage}
            </div>
          )}
          
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.category} className="flex items-center">
                <div 
                  className="w-4 h-4 mr-2 rounded-sm"
                  style={{ backgroundColor: CATEGORY_COLORS[budget.category] }}
                />
                <span className="w-24 text-gray-700">{budget.category}</span>
                <div className="ml-4 flex-1">
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    value={budget.limit}
                    onChange={(e) => handleBudgetChange(
                      budget.category,
                      parseFloat(e.target.value) || 0
                    )}
                    fullWidth
                  />
                </div>
              </div>
            ))}
          </div>
          
          <Button
            onClick={handleSaveBudgets}
            className="mt-4"
          >
            Save Budget Settings
          </Button>
        </CardContent>
      </Card>
      
      {/* Data Management */}
      <Card className="mb-6">
        <CardTitle>Data Management</CardTitle>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Export Data</h3>
              <p className="text-gray-600 mb-3">
                Download your expense data as a JSON file for backup or transfer.
              </p>
              <Button
                onClick={handleExportData}
                variant="outline"
              >
                Export Data
              </Button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Import Data</h3>
              <p className="text-gray-600 mb-3">
                Import previously exported expense data.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              />
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-text-red-600 mb-2">Danger Zone</h3>
              <p className="text-gray-600 mb-3">
                Clear all your expense data. This action cannot be undone.
              </p>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Settings */}
      <Card>
        <CardTitle>Account Settings</CardTitle>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Display Name"
              placeholder="Your Name"
              defaultValue="User"
              fullWidth
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              defaultValue="user@example.com"
              fullWidth
            />
            
            <div className="pt-4">
              <Button>
                Save Account Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;