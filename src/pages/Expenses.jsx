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
  XMarkIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import ExpenseModal from '../components/ExpenseModal';
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { budgetService } from '../services/budgetService';

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
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(initialCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  // Load expenses and categories from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        const loadedExpenses = await budgetService.getExpenses(user.uid);
        setExpenses(loadedExpenses);
        
        const budgetData = await budgetService.getMasterBudget(user.uid);
        if (budgetData?.categories) {
          setCategories(budgetData.categories);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load expenses');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.uid]);

  // Check for upcoming due dates
  useEffect(() => {
    const checkDueDates = () => {
      const today = new Date();
      const threeDaysFromNow = addDays(today, 3);
      
      expenses.forEach(expense => {
        if (expense.dueDate && expense.paymentStatus !== 'Paid') {
          const dueDate = new Date(expense.dueDate);
          
          if (isBefore(dueDate, today)) {
            toast.error(`Payment overdue for ${expense.expenseName}!`, {
              toastId: `overdue-${expense.id}`,
            });
          } else if (isBefore(dueDate, threeDaysFromNow)) {
            toast.warning(`Payment for ${expense.expenseName} due in ${format(dueDate, 'PPP')}`, {
              toastId: `upcoming-${expense.id}`,
            });
          }
        }
      });
    };

    checkDueDates();
    // Check every day
    const interval = setInterval(checkDueDates, 86400000);
    return () => clearInterval(interval);
  }, [expenses]);

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

  // Handle saving new expense
  const handleSaveExpense = async (expenseData) => {
    if (!user?.uid) return;

    try {
      const savedExpense = editingExpense
        ? await budgetService.updateExpense(editingExpense.id, { ...expenseData, userId: user.uid })
        : await budgetService.addExpense(user.uid, expenseData);

      setExpenses(prev => {
        if (editingExpense) {
          return prev.map(exp => exp.id === editingExpense.id ? savedExpense : exp);
        }
        return [...prev, savedExpense];
      });
      
      setModalOpen(false);
      setEditingExpense(null);
      toast.success(`Expense ${editingExpense ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
  };

  // Handle deleting expense
  const handleDeleteExpense = async (expenseId) => {
    if (!user?.uid) return;
    
    try {
      await budgetService.deleteExpense(expenseId);
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      toast.success('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
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

  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  // Calculate payment status distribution
  const paymentStatusTotals = expenses.reduce((acc, expense) => {
    acc[expense.paymentStatus || 'Pending'] = (acc[expense.paymentStatus || 'Pending'] || 0) + expense.amount;
    return acc;
  }, {});

  const paymentStatusData = Object.entries(paymentStatusTotals).map(([name, value]) => ({
    name,
    value
  }));

  // Calculate monthly trends (last 6 months)
  const getMonthlyData = () => {
    const today = new Date();
    const sixMonthsAgo = subMonths(today, 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: today });

    return months.map(month => {
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return isAfter(expenseDate, startOfMonth(month)) && 
               isBefore(expenseDate, endOfMonth(month));
      });

      const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        name: format(month, 'MMM'),
        amount: total
      };
    });
  };

  const monthlyData = getMonthlyData();

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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

      {/* Total Expenses Card with Charts */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="grid grid-cols-4 gap-12">
          {/* Total Amount */}
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Total Expenses</h2>
            <div className="text-4xl font-bold text-primary-600">
              ${totalExpenses.toLocaleString()}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {expenses.length} total transactions
            </div>
          </div>

          {/* Category Distribution */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              {/* Top 2 categories by amount */}
              {categoryData
                .sort((a, b) => b.value - a.value)
                .slice(0, 2)
                .map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-600">{category.name}</span>
                    </div>
                    <span className="font-medium">${category.value.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Payment Status Distribution */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Status</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Paid' ? '#00C49F' : 
                              entry.name === 'Partial' ? '#FFBB28' : '#FF8042'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {paymentStatusData.map((status) => (
                <div key={status.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ 
                        backgroundColor: status.name === 'Paid' ? '#00C49F' : 
                                       status.name === 'Partial' ? '#FFBB28' : '#FF8042'
                      }}
                    />
                    <span className="text-gray-600">{status.name}</span>
                  </div>
                  <span className="font-medium">${status.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Trend</h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                    labelFormatter={(label) => `${label}`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {/* Show highest and lowest months */}
              {(() => {
                const sortedData = [...monthlyData].sort((a, b) => b.amount - a.amount);
                const highest = sortedData[0];
                const lowest = sortedData[sortedData.length - 1];
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Highest ({highest.name})</span>
                      <span className="font-medium">${highest.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lowest ({lowest.name})</span>
                      <span className="font-medium">${lowest.amount.toLocaleString()}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
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
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
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
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.expenseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${expense.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                        expense.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {expense.paymentStatus}
                      {expense.paymentStatus === 'Paid' && <CheckIcon className="ml-1 h-4 w-4" />}
                      {expense.paymentStatus === 'Pending' && <ClockIcon className="ml-1 h-4 w-4" />}
                      {expense.paymentStatus === 'Partial' && (
                        <span className="ml-1 text-xs">
                          (${expense.paidAmount?.toLocaleString()})
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {expense.dueDate && (
                      <span className={`flex items-center ${
                        isAfter(new Date(), new Date(expense.dueDate)) && expense.paymentStatus !== 'Paid'
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {format(new Date(expense.dueDate), 'MMM d, yyyy')}
                        {isAfter(new Date(), new Date(expense.dueDate)) && expense.paymentStatus !== 'Paid' && (
                          <ExclamationCircleIcon className="ml-1 h-4 w-4" />
                        )}
                      </span>
                    )}
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
                    <div className="flex flex-col">
                      <span>${expense.amount.toFixed(2)}</span>
                      {expense.paymentMethod && (
                        <span className="text-xs text-gray-500">
                          via {expense.paymentMethod}
                        </span>
                      )}
                    </div>
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

      {/* Toast Container for Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
