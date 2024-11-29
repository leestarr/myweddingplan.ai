import { useState } from 'react';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function CategoryBudgetCard({ 
  category, 
  budget, 
  spent, 
  onAddExpense,
  onUpdateBudget 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(budget);
  const remaining = budget - spent;
  const percentageSpent = (spent / budget) * 100;

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdateBudget(category, parseFloat(editValue) || 0);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
          <button
            onClick={onAddExpense}
            className="text-blue-600 hover:text-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Budget</span>
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="flex items-center">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-20 px-2 py-1 border rounded-md text-right"
                autoFocus
                onBlur={() => setIsEditing(false)}
              />
            </form>
          ) : (
            <div className="flex items-center">
              <span className="text-gray-900 font-medium">${budget.toLocaleString()}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-1.5 text-gray-400 hover:text-gray-600"
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Spent</span>
          <span className="text-gray-900 font-medium">${spent.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Remaining</span>
          <span className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${remaining.toLocaleString()}
          </span>
        </div>

        <div className="pt-1">
          <div className="flex justify-end mb-1">
            <span className="text-xs text-gray-600">{percentageSpent.toFixed(0)}% Used</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${remaining < 0 ? 'bg-red-500' : 'bg-primary-500'}`}
              style={{ width: `${Math.min(percentageSpent, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
