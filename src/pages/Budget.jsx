import { useState, useEffect } from 'react';
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ExpenseModal from '../components/ExpenseModal';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  // Calculate totals and prepare chart data
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = masterBudget - totalExpenses;
  const percentageSpent = masterBudget > 0 ? (totalExpenses / masterBudget) * 100 : 0;

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  // Prepare chart data
  const chartData = {
    labels: initialCategories,
    datasets: [
      {
        label: 'Expenses',
        data: initialCategories.map(cat => expensesByCategory[cat] || 0),
        backgroundColor: 'rgba(14, 165, 233, 0.5)', // primary-500 with opacity
        borderColor: 'rgb(14, 165, 233)', // primary-500
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Expenses by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value.toLocaleString(),
        },
      },
    },
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      // Update existing expense
      setExpenses(prevExpenses =>
        prevExpenses.map(exp =>
          exp === editingExpense ? expenseData : exp
        )
      );
    } else {
      // Add new expense
      setExpenses(prevExpenses => [...prevExpenses, expenseData]);
    }
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    // Prepare CSV data
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.category,
      exp.description,
      exp.amount.toFixed(2)
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\\n');

    // Create and trigger download
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budget</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your wedding expenses
          </p>
        </div>
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

      {/* Budget Overview */}
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

      {/* Chart and Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Bar options={chartOptions} data={chartData} />
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Expenses</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No expenses added yet</p>
            ) : (
              expenses.map((expense, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        expense.amount > (masterBudget * 0.1) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        ${expense.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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
