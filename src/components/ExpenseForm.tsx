import React, { useState } from 'react';
import { Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { useExpenses } from '../context/ExpenseContext';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseForm: React.FC = () => {
  const { addExpense } = useExpenses();
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<Category>('Housing');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const categoryOptions = Object.keys(CATEGORY_COLORS).map(cat => ({
    value: cat,
    label: cat
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Clear error if any
    setError('');
    
    // Add expense
    addExpense({
      amount: Number(amount),
      category: category as Category,
      date,
      notes
    });
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    // Reset form
    setAmount('');
    setCategory('Housing');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 text-green-800 p-4 rounded-md"
          >
            Expense added successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={error}
          fullWidth
          required
        />
        
        <Select
          label="Category"
          options={categoryOptions}
          value={category}
          onChange={(value) => setCategory(value as Category)}
          fullWidth
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          required
        />
        
        <Input
          label="Notes (Optional)"
          type="text"
          placeholder="Add notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
        />
      </div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          type="submit" 
          variant="primary" 
          fullWidth
          className="mt-4"
        >
          Add Expense
        </Button>
      </motion.div>
    </form>
  );
};

export default ExpenseForm;