import React, { useState } from 'react';
import { useAppContext } from '../../utils/context/AppContext';

interface MonthSelectorProps {
  onClose: () => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ onClose }) => {
  const { currentBusinessMonth, setCurrentBusinessMonth } = useAppContext();
  
  const [year, month] = currentBusinessMonth.split('-');
  const [selectedYear, setSelectedYear] = useState(parseInt(year));
  const [selectedMonth, setSelectedMonth] = useState(parseInt(month));
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  
  const handleApply = () => {
    const formattedMonth = String(selectedMonth).padStart(2, '0');
    setCurrentBusinessMonth(`${selectedYear}-${formattedMonth}`);
    onClose();
  };
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Business Month</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
        <select 
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
        <div className="grid grid-cols-3 gap-2">
          {months.map((monthName, index) => (
            <button
              key={monthName}
              className={`py-2 text-sm rounded-md ${
                selectedMonth === index + 1
                  ? 'bg-teal-100 text-teal-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedMonth(index + 1)}
            >
              {monthName}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button 
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default MonthSelector;