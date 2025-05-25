import React from 'react';
import { Period } from '../types';
import { MONTHS } from '../constants';
import { useExpenses } from '../context/ExpenseContext';

const PeriodSelector: React.FC = () => {
  const { selectedPeriod, setSelectedPeriod } = useExpenses();
  const currentMonth = MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const periods: { value: Period; label: string }[] = [
    { value: 'Daily', label: 'Today' },
    { value: 'Weekly', label: 'This Week' },
    { value: 'Monthly', label: `${currentMonth} ${currentYear}` },
    { value: 'Yearly', label: `${currentYear}` },
  ];

  return (
    <div className="flex items-center mb-4">
      <label htmlFor="period-select" className="mr-2 text-gray-700">
        Period:
      </label>
      <select
        id="period-select"
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value as Period)}
        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PeriodSelector;