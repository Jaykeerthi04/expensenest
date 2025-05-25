import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardTitle, CardContent } from '../components/ui/Card';
import ExpenseForm from '../components/ExpenseForm';
import { useExpenses } from '../context/ExpenseContext';

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const { expenses } = useExpenses();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Expense</h1>
        
        <Card>
          <CardTitle>Enter Expense Details</CardTitle>
          <CardContent>
            <ExpenseForm />
          </CardContent>
        </Card>
        
        {expenses.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpense;