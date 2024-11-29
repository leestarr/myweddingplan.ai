import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CategoryManager({ categories, onAddCategory, onDeleteCategory, selectedValue, onChange }) {
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
      setIsAdding(false);
    }
  };

  const handleDelete = (category) => {
    if (categories.length > 1) {
      onDeleteCategory(category);
      // If the deleted category was selected, select the first available category
      if (selectedValue === category) {
        const newCategories = categories.filter(c => c !== category);
        onChange(newCategories[0]);
      }
    }
  };

  return (
    <div className="relative">
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pr-20"
      >
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* Add Category Button */}
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <PlusIcon className="h-5 w-5" />
      </button>

      {/* Delete Category Button */}
      <button
        type="button"
        onClick={() => handleDelete(selectedValue)}
        disabled={categories.length <= 1}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-colors ${
          categories.length <= 1 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-400 hover:text-red-600'
        }`}
      >
        <TrashIcon className="h-5 w-5" />
      </button>

      {/* Add Category Modal */}
      {isAdding && (
        <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <form onSubmit={handleSubmit} className="p-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              autoFocus
            />
            <div className="mt-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewCategory('');
                }}
                className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newCategory.trim()}
                className={`rounded px-3 py-1.5 text-sm text-white transition-colors ${
                  newCategory.trim() 
                    ? 'bg-primary-500 hover:bg-primary-600' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
