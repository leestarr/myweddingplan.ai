import { useState, useEffect } from 'react';
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import ExpenseModal from '../components/ExpenseModal';
import ExpenseTable from '../components/ExpenseTable';

// Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

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

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('weddingExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('weddingMasterBudget', masterBudget.toString());
    localStorage.setItem('weddingBudgetLocked', JSON.stringify(budgetLocked));
    localStorage.setItem('weddingExpenses', JSON.stringify(expenses));
  }, [masterBudget, budgetLocked, expenses]);

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = masterBudget - totalExpenses;
  const percentageSpent = masterBudget > 0 ? (totalExpenses / masterBudget) * 100 : 0;

  const handleAddExpense = () => {
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
      {/* Budget Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Budget</h3>
          <div className="mt-2 flex items-center">
            <input
              type="number"
              value={masterBudget}
              onChange={(e) => !budgetLocked && setMasterBudget(parseFloat(e.target.value) || 0)}
              disabled={budgetLocked}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => setBudgetLocked(!budgetLocked)}
              className={`ml-2 p-2 rounded-md ${
                budgetLocked 
                  ? 'text-primary-600 hover:text-primary-700' 
                  : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <span className="sr-only">{budgetLocked ? 'Unlock' : 'Lock'} budget</span>
              {budgetLocked ? '🔒' : '🔓'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
          <p className={`mt-2 text-3xl font-semibold ${
            totalExpenses > masterBudget ? 'text-red-600' : 'text-gray-900'
          }`}>
            ${totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
          <p className={`mt-2 text-3xl font-semibold ${
            remainingBudget < 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            ${remainingBudget.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Budget Used</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {percentageSpent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Main Expenses Section */}
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
                onClick={handleAddExpense}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Expense
              </button>
            </div>
          </div>

          {/* Expenses Table */}
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
      />
    </div>
  );
}
