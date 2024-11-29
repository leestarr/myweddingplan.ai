import { useState, useEffect, useMemo } from 'react';
import { PlusIcon, ArrowDownTrayIcon, ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, Cog6ToothIcon, PencilIcon, DocumentDuplicateIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ExpenseModal from '../components/ExpenseModal';
import CategoryModal from '../components/CategoryModal';
import BudgetTreeView from '../components/BudgetTreeView';

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

  // Add sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

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
      'Venue & Ceremony': 0.4,
      'Catering & Drinks': 0.25,
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
        budget: masterBudget * (suggestedSplits[category] || 0.1), // Default 10% if not specified
        expenses: []
      };
    });

    // Calculate spent amounts and collect expenses
    expenses.forEach(expense => {
      if (totals[expense.category]) {
        totals[expense.category].spent += expense.amount;
        totals[expense.category].expenses.push(expense);
      }
    });

    return totals;
  }, [expenses, masterBudget, categories]);

  // Calculate total budget from categories
  const totalBudget = Object.values(categoryData).reduce((sum, category) => 
    sum + (category.budget || 0), 0
  );

  // Calculate total spent from all expenses
  const totalSpent = Object.values(categoryData).reduce((sum, category) => 
    sum + (category.spent || 0), 0
  );

  const handleAddExpense = (category = null) => {
    setSelectedCategory(category);
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleDeleteExpense = (index) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prevExpenses => prevExpenses.filter((exp, i) => i !== index));
    }
  };

  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      setExpenses(prevExpenses =>
        prevExpenses.map((exp, i) =>
          i === expenses.indexOf(editingExpense) ? expenseData : exp
        )
      );
    } else {
      setExpenses(prevExpenses => [...prevExpenses, expenseData]);
    }
    setModalOpen(false);
  };

  const handleUpdateBudget = (category, newBudget) => {
    const updatedCategoryData = {
      ...categoryData,
      [category]: {
        ...categoryData[category],
        budget: newBudget
      }
    };
    setCategoryData(updatedCategoryData);
    localStorage.setItem('categoryData', JSON.stringify(updatedCategoryData));
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

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination values
  const totalItems = expenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const sortedData = sortData(expenses, sortConfig.key, sortConfig.direction);
    return sortedData.slice(startIndex, endIndex);
  };

  // Add inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});

  // Inline edit handlers
  const startEditing = (expense) => {
    setEditingId(expense.id);
    setEditingData({ ...expense });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveEditing = async () => {
    try {
      const expenseRef = doc(db, 'expenses', editingId);
      await updateDoc(expenseRef, editingData);
      
      // Update local state
      setExpenses(expenses.map(exp => 
        exp.id === editingId ? { ...editingData } : exp
      ));
      
      setEditingId(null);
      setEditingData({});
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  // Duplicate expense handler
  const duplicateExpense = async (expense) => {
    const newExpense = {
      ...expense,
      id: undefined, // Firebase will generate a new ID
      date: new Date().toISOString().split('T')[0], // Set to today's date
      description: `${expense.description} (Copy)`,
    };

    try {
      const docRef = await addDoc(collection(db, 'expenses'), newExpense);
      const expenseWithId = { ...newExpense, id: docRef.id };
      setExpenses([...expenses, expenseWithId]);
    } catch (error) {
      console.error('Error duplicating expense:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header Stats */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:leading-9">
                      Budget Overview
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-lg font-semibold text-gray-900">${totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-lg font-semibold text-gray-900">${totalSpent.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className={`text-lg font-semibold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(totalBudget - totalSpent).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              totalSpent > masterBudget ? 'text-red-600' : 'text-gray-900'
            }`}>
              ${totalSpent.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Remaining</h3>
            <p className={`mt-2 text-2xl font-semibold ${
              masterBudget - totalSpent < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${(masterBudget - totalSpent).toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Budget Used</h3>
            <div className="mt-2">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${Math.min((totalSpent / masterBudget) * 100, 100)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      (totalSpent / masterBudget) * 100 > 100 ? 'bg-red-500' : 'bg-primary-500'
                    }`}
                  />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-semibold inline-block">
                    {((totalSpent / masterBudget) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Tree */}
      <BudgetTreeView
        categories={categories}
        categoryData={categoryData}
        onAddExpense={handleAddExpense}
        onUpdateBudget={handleUpdateBudget}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveExpense}
        categories={categories}
        editingExpense={editingExpense}
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
