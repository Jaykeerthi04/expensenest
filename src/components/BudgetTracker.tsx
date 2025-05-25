import React from 'react';
import { Budget } from '../types';
import { CATEGORY_COLORS } from '../constants';
import Card, { CardTitle, CardContent } from './ui/Card';

interface BudgetTrackerProps {
  budgets: Budget[];
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ budgets }) => {
  return (
    <Card>
      <CardTitle>Budget Tracker</CardTitle>
      <CardContent>
        <div className="space-y-4 mt-2">
          {budgets.map((budget) => {
            const percentage = Math.min(100, (budget.spent / budget.limit) * 100);
            const remaining = Math.max(0, budget.limit - budget.spent);
            
            // Determine status color
            let statusColor = 'bg-green-500';
            if (percentage >= 90) {
              statusColor = 'bg-red-500';
            } else if (percentage >= 75) {
              statusColor = 'bg-orange-500';
            } else if (percentage >= 50) {
              statusColor = 'bg-yellow-500';
            }
            
            return (
              <div key={budget.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{budget.category}</span>
                  <span>
                    ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${statusColor} transition-all duration-500 ease-in-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-right text-gray-500">
                  ${remaining.toFixed(2)} remaining
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetTracker;