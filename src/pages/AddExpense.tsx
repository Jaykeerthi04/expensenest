import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card, { CardTitle, CardContent } from '../components/ui/Card';
import ExpenseForm from '../components/ExpenseForm';
import { useExpenses } from '../context/ExpenseContext';

const AddExpense: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Expense</h1>
          <p className="text-gray-600 mb-8">Track your spending and manage your finances</p>
          
          <Card className="rounded-2xl shadow-lg">
            <CardTitle className="font-bold text-xl px-8 pt-8">Enter Expense Details</CardTitle>
            <CardContent className="p-8">
              <ExpenseForm />
            </CardContent>
          </Card>
          
          {useExpenses().expenses.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
              >
                ← Return to Dashboard
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AddExpense;