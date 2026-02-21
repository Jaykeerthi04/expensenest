import React from 'react';
import { Budget } from '../types';
import { CATEGORY_COLORS } from '../constants';
import Card, { CardTitle, CardContent } from './ui/Card';

interface BudgetTrackerProps {
  budgets: Budget[];
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ budgets }) => {
  return (
    <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
      <CardTitle className="font-bold text-lg px-6 pt-6">Budget Tracker</CardTitle>
      <CardContent className="p-6">
        {budgets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No budgets set yet. Create a budget to track your spending.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.map((budget) => {
              const percentage = Math.min(100, (budget.spent / budget.limit) * 100);
              const remaining = Math.max(0, budget.limit - budget.spent);
              
              // Determine status color
              let statusColor = 'bg-green-500';
              let statusText = 'On track';
              if (percentage >= 90) {
                statusColor = 'bg-red-500';
                statusText = 'Budget exceeded';
              } else if (percentage >= 75) {
                statusColor = 'bg-orange-500';
                statusText = 'Almost there';
              } else if (percentage >= 50) {
                statusColor = 'bg-yellow-500';
                statusText = 'Halfway there';
              }
              
              return (
                <div key={budget.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: CATEGORY_COLORS[budget.category as keyof typeof CATEGORY_COLORS] }}
                      />
                      <span className="font-semibold text-gray-900">{budget.category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">₹{budget.spent.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">of ₹{budget.limit.toFixed(2)}</div>
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                        percentage >= 90 ? 'bg-red-50 text-red-700' :
                        percentage >= 75 ? 'bg-orange-50 text-orange-700' :
                        percentage >= 50 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${statusColor} transition-all duration-500 ease-in-out rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">₹{remaining.toFixed(2)} remaining</span>
                    <span className="text-gray-500">{statusText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetTracker;