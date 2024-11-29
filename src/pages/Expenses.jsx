import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  ChevronUpDownIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ExpenseModal from '../components/ExpenseModal';

const initialCategories = [
  'Venue & Ceremony',
  'Catering & Drinks',
  'Decor',
  'Photography',
  'Entertainment',
  'Attire',
  'Transportation',
  'Other'
];

export default function Expenses() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('weddingExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('weddingCategories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('weddingExpenses', JSON.stringify(expenses));
  }, [expenses]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('weddingCategories', JSON.stringify(categories));
  }, [categories]);

  // Update categories whenever they change in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCategories = localStorage.getItem('weddingCategories');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sorting function
  const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      if (key === 'date') {
        return direction === 'asc' 
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      if (key === 'amount') {
        return direction === 'asc' 
          ? a[key] - b[key]
          : b[key] - a[key];
      }
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setExpenses(sortData(expenses, key, direction));
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4 text-gray-600" />
      : <ChevronDownIcon className="h-4 w-4 text-gray-600" />;
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseId));
    }
  };

  const handleDuplicateExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Math.max(0, ...expenses.map(e => e.id)) + 1,
      date: new Date().toISOString().split('T')[0],
      description: `${expense.description} (Copy)`,
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      setExpenses(prevExpenses =>
        prevExpenses.map(exp =>
          exp.id === editingExpense.id ? { ...expenseData, id: editingExpense.id } : exp
        )
      );
    } else {
      const newExpense = {
        ...expenseData,
        id: Math.max(0, ...expenses.map(e => e.id)) + 1,
      };
      setExpenses(prevExpenses => [...prevExpenses, newExpense]);
    }
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Expense', 'Category', 'Description', 'Vendor', 'Amount'];
    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.expenseName,
      exp.category,
      exp.description,
      exp.vendor,
      exp.amount.toFixed(2)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'wedding_expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all your wedding expenses
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
            Export
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

      {/* Total Expenses Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Expenses</h2>
        <div className="text-3xl font-bold text-primary-600">
          ${totalExpenses.toLocaleString()}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="group inline-flex items-center space-x-1"
                    onClick={() => handleSort('date')}
                  >
                    <span>Date</span>
                    {getSortIcon('date')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="group inline-flex items-center space-x-1"
                    onClick={() => handleSort('expenseName')}
                  >
                    <span>Expense</span>
                    {getSortIcon('expenseName')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="group inline-flex items-center space-x-1"
                    onClick={() => handleSort('category')}
                  >
                    <span>Category</span>
                    {getSortIcon('category')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="group inline-flex items-center space-x-1"
                    onClick={() => handleSort('vendor')}
                  >
                    <span>Vendor</span>
                    {getSortIcon('vendor')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="group inline-flex items-center space-x-1"
                    onClick={() => handleSort('amount')}
                  >
                    <span>Amount</span>
                    {getSortIcon('amount')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.expenseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateExpense(expense)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveExpense}
        expense={editingExpense}
        categories={categories}
      />
    </div>
  );
}
