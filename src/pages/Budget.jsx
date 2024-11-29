import { useState, useEffect, useMemo } from 'react';
import { PlusIcon, ArrowDownTrayIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import ExpenseModal from '../components/ExpenseModal';
import CategoryModal from '../components/CategoryModal';
import ExpenseTable from '../components/ExpenseTable';
import CategoryBudgetCard from '../components/CategoryBudgetCard';

const initialCategories = [
  'Venue',
  'Catering',
  'Decor',
  'Photography',
  'Entertainment',
  'Attire',
  'Transportation',
  'Other'
];

export default function Budget() {
  const [masterBudget, setMasterBudget] = useState(() => {
    const saved = localStorage.getItem('weddingMasterBudget');
    return saved ? parseFloat(saved) : 0;
  });
  
  const [budgetLocked, setBudgetLocked] = useState(() => {
    const saved = localStorage.getItem('weddingBudgetLocked');
    return saved ? JSON.parse(saved) : false;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('weddingCategories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('weddingExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('weddingMasterBudget', masterBudget.toString());
    localStorage.setItem('weddingBudgetLocked', JSON.stringify(budgetLocked));
    localStorage.setItem('weddingExpenses', JSON.stringify(expenses));
    localStorage.setItem('weddingCategories', JSON.stringify(categories));
  }, [masterBudget, budgetLocked, expenses, categories]);

  // Calculate category totals and suggested budgets
  const categoryData = useMemo(() => {
    const totals = {};
    const suggestedSplits = {
      'Venue': 0.4,
      'Catering': 0.25,
      'Decor': 0.1,
      'Photography': 0.1,
      'Entertainment': 0.05,
      'Attire': 0.05,
      'Transportation': 0.03,
      'Other': 0.02
    };

    // Initialize totals
    categories.forEach(category => {
      totals[category] = {
        spent: 0,
        budget: masterBudget * (suggestedSplits[category] || 0.1) // Default 10% if not specified
      };
    });

    // Calculate spent amounts
    expenses.forEach(expense => {
      if (totals[expense.category]) {
        totals[expense.category].spent += expense.amount;
      }
    });

    return totals;
  }, [expenses, masterBudget, categories]);

  // Calculate overall totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = masterBudget - totalExpenses;
  const percentageSpent = masterBudget > 0 ? (totalExpenses / masterBudget) * 100 : 0;

  const handleAddExpense = (category = null) => {
    setSelectedCategory(category);
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleDeleteExpense = (expense) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prevExpenses => prevExpenses.filter(exp => exp !== expense));
    }
  };

  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      setExpenses(prevExpenses =>
        prevExpenses.map(exp =>
          exp === editingExpense ? expenseData : exp
        )
      );
    } else {
      setExpenses(prevExpenses => [...prevExpenses, expenseData]);
    }
    setModalOpen(false);
  };

  const handleUpdateCategoryBudget = (category, newBudget) => {
    const newTotals = { ...categoryData };
    newTotals[category].budget = newBudget;
    // Save the updated budgets to localStorage
    localStorage.setItem('weddingCategoryBudgets', JSON.stringify(
      Object.fromEntries(
        Object.entries(newTotals).map(([cat, data]) => [cat, data.budget])
      )
    ));
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.category,
      exp.description,
      exp.amount.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'wedding_budget.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Master Budget Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-900">Total Wedding Budget</h2>
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 text-sm font-medium transition-colors"
              title="Manage Categories"
            >
              <Cog6ToothIcon className="h-4 w-4 mr-1.5" />
              Manage Categories
            </button>
          </div>
          <div className="flex items-center bg-gray-50 rounded-lg p-2">
            <span className="text-gray-500 text-lg mr-2">$</span>
            <input
              type="number"
              value={masterBudget}
              onChange={(e) => !budgetLocked && setMasterBudget(parseFloat(e.target.value) || 0)}
              disabled={budgetLocked}
              className="text-2xl font-semibold w-40 bg-transparent border-none focus:ring-0 text-gray-900 disabled:bg-transparent disabled:text-gray-900"
              placeholder="0"
            />
            <button
              onClick={() => setBudgetLocked(!budgetLocked)}
              className={`ml-2 p-2 rounded-md transition-colors ${
                budgetLocked 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={budgetLocked ? 'Unlock budget' : 'Lock budget'}
            >
              {budgetLocked ? '🔒' : '🔓'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
            <p className={`mt-2 text-2xl font-semibold ${
              totalExpenses > masterBudget ? 'text-red-600' : 'text-gray-900'
            }`}>
              ${totalExpenses.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
            <p className={`mt-2 text-2xl font-semibold ${
              remainingBudget < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${remainingBudget.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Budget Used</h3>
            <div className="mt-2">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${Math.min(percentageSpent, 100)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      percentageSpent > 100 ? 'bg-red-500' : 'bg-primary-500'
                    }`}
                  />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-semibold inline-block">
                    {percentageSpent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map(category => (
          <CategoryBudgetCard
            key={category}
            category={category}
            budget={categoryData[category]?.budget || 0}
            spent={categoryData[category]?.spent || 0}
            onAddExpense={() => handleAddExpense(category)}
            onUpdateBudget={handleUpdateCategoryBudget}
          />
        ))}
      </div>

      {/* Expenses Table Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
            <div className="flex space-x-4">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
                Export CSV
              </button>
              <button
                onClick={() => handleAddExpense()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Expense
              </button>
            </div>
          </div>

          <ExpenseTable
            expenses={expenses}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            masterBudget={masterBudget}
          />
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveExpense}
        expense={editingExpense}
        initialCategory={selectedCategory}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={(category) => {
          setCategories(prev => [...prev, category]);
        }}
        onDeleteCategory={(category) => {
          if (window.confirm(`Are you sure you want to delete the "${category}" category? This will not delete existing expenses.`)) {
            setCategories(prev => prev.filter(c => c !== category));
          }
        }}
      />
    </div>
  );
}
