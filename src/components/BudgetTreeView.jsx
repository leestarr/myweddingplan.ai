import { useState } from 'react';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function BudgetTreeView({
  categories,
  categoryData,
  onAddExpense,
  onUpdateBudget
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (category, budget) => {
    setEditingCategory(category);
    setEditValue(budget.toString());
  };

  const handleEditSubmit = (category, newValue) => {
    const newBudget = parseFloat(newValue);
    if (!isNaN(newBudget)) {
      onUpdateBudget(category, newBudget);
    }
    setEditingCategory(null);
    setEditValue('');
  };

  const handleBlur = (category, value) => {
    // Small timeout to ensure the form submission happens first if both events occur
    setTimeout(() => {
      if (editingCategory === category) {
        handleEditSubmit(category, value);
      }
    }, 100);
  };

  return (
    <div className="space-y-2 bg-white rounded-lg shadow-sm p-6">
      {categories.map(category => {
        const { budget = 0, spent = 0, expenses = [] } = categoryData[category] || {};
        const remaining = budget - spent;
        const expenseCount = expenses.length;

        return (
          <div key={category} className="group">
            {/* Category Header */}
            <div className="flex items-center py-2 hover:bg-gray-50 rounded-md group-first:mt-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{category}</span>
                  <div className="ml-2 text-gray-500 flex items-center">
                    (
                    {editingCategory === category ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleEditSubmit(category, editValue);
                        }}
                        className="inline-flex items-center"
                      >
                        <span className="text-gray-500 mr-1">$</span>
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleBlur(category, editValue)}
                          className="w-24 border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <div className="flex items-center">
                        <span>${budget.toLocaleString()}</span>
                        <button
                          onClick={() => handleEditStart(category, budget)}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    )
                  </div>
                </div>
              </div>
              <button
                onClick={() => onAddExpense(category)}
                className="ml-4 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Quick Add
              </button>
            </div>

            {/* Expense Summary and List */}
            <div className="ml-6 border-l-2 border-gray-200 pl-4">
              {expenseCount > 0 ? (
                <>
                  <div className="py-2">
                    <div className="flex items-center text-sm">
                      <div className="flex-1">
                        <span className="text-gray-600">
                          {expenseCount} expense{expenseCount !== 1 ? 's' : ''}, 
                          <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                            {' '}${remaining.toLocaleString()} remaining
                          </span>
                        </span>
                      </div>
                      <div className="ml-4 flex items-center">
                        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${remaining < 0 ? 'bg-red-500' : 'bg-primary-500'}`}
                            style={{ width: `${Math.min((spent / budget) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Individual Expenses */}
                  <div className="space-y-1 pb-2">
                    {expenses.map((expense, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="text-gray-600">{expense.description}</span>
                        <span className="text-gray-900 font-medium">
                          ${expense.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-2">
                  <span className="text-gray-500 text-sm">No expenses yet</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
