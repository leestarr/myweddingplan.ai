import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 12 months', days: 365 },
];

export default function ExpenseTable({ expenses, onEditExpense, onDeleteExpense, masterBudget }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Get unique categories and amount range from expenses
  const { categories, minAmount, maxAmount } = useMemo(() => {
    const uniqueCategories = new Set(expenses.map(expense => expense.category));
    const amounts = expenses.map(expense => expense.amount);
    return {
      categories: Array.from(uniqueCategories).sort(),
      minAmount: Math.min(...amounts, 0),
      maxAmount: Math.max(...amounts, 0),
    };
  }, [expenses]);

  // Handle date preset selection
  const handleDatePreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  };

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (globalFilter) count++;
    if (dateRange.start || dateRange.end) count++;
    if (selectedCategories.length > 0) count++;
    if (amountRange.min || amountRange.max) count++;
    return count;
  }, [globalFilter, dateRange, selectedCategories, amountRange]);

  // Custom filter function
  const filterExpenses = (rows) => {
    return rows.filter(row => {
      const expenseDate = new Date(row.original.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      const amount = row.original.amount;
      
      // Date range filter
      if (startDate && endDate) {
        if (expenseDate < startDate || expenseDate > endDate) return false;
      } else if (startDate && expenseDate < startDate) return false;
      else if (endDate && expenseDate > endDate) return false;

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(row.original.category)) {
        return false;
      }

      // Amount range filter
      if (amountRange.min && amount < Number(amountRange.min)) return false;
      if (amountRange.max && amount > Number(amountRange.max)) return false;

      // Global search filter
      if (globalFilter) {
        const searchTerm = globalFilter.toLowerCase();
        return (
          row.original.description.toLowerCase().includes(searchTerm) ||
          row.original.category.toLowerCase().includes(searchTerm) ||
          row.original.amount.toString().includes(searchTerm)
        );
      }

      return true;
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: (info) => {
          const amount = info.getValue();
          const isOverBudget = amount > (masterBudget * 0.1);
          return (
            <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
              ${amount.toLocaleString()}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: (info) => (
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => onEditExpense(info.row.original)}
              className="text-primary-600 hover:text-primary-900"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteExpense(info.row.original)}
              className="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [masterBudget, onEditExpense, onDeleteExpense]
  );

  const table = useReactTable({
    data: expenses,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      custom: filterExpenses,
    },
    globalFilterFn: 'custom',
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-lg">
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search expenses..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-4 flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {globalFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                Search: {globalFilter}
                <button
                  onClick={() => setGlobalFilter('')}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {(dateRange.start || dateRange.end) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                Date: {dateRange.start} - {dateRange.end}
                <button
                  onClick={() => setDateRange({ start: '', end: '' })}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {selectedCategories.length > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                Categories: {selectedCategories.length}
                <button
                  onClick={() => setSelectedCategories([])}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
            {(amountRange.min || amountRange.max) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                Amount: ${amountRange.min || '0'} - ${amountRange.max || '∞'}
                <button
                  onClick={() => setAmountRange({ min: '', max: '' })}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-6">
            {/* Date Range Section */}
            <div className="flex-1 min-w-[300px] space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Date Range</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="dd/mm/yyyy"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {DATE_PRESETS.map(preset => (
                    <button
                      key={preset.days}
                      onClick={() => handleDatePreset(preset.days)}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className="flex-1 min-w-[250px] space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Categories</h3>
              <div className="p-2 border border-gray-200 rounded-md bg-white">
                {categories.map(category => (
                  <label key={category} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        setSelectedCategories(prev =>
                          e.target.checked
                            ? [...prev, category]
                            : prev.filter(c => c !== category)
                        );
                      }}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amount Range Section */}
            <div className="flex-1 min-w-[300px] space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Amount Range</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    value={amountRange.min}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="number"
                    value={amountRange.max}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Range: ${minAmount.toLocaleString()} - ${maxAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setDateRange({ start: '', end: '' });
                setSelectedCategories([]);
                setAmountRange({ min: '', max: '' });
                setGlobalFilter('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center space-x-1'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {{
                          asc: <ChevronUpIcon className="w-4 h-4" />,
                          desc: <ChevronDownIcon className="w-4 h-4" />,
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                ))
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Page{' '}
            <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="font-medium">{table.getPageCount()}</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            className="block w-full px-3 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
