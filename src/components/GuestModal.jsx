import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CATEGORIES = ['Bride Side', 'Groom Side', 'Wedding Party', 'Family', 'Friends', 'Colleagues'];
const GROUPS = ['Family', 'Friends', 'Colleagues', 'Other'];
const STATUSES = ['Pending', 'Confirmed', 'Declined'];
const MEAL_OPTIONS = ['Chicken', 'Fish', 'Vegetarian', 'Vegan', 'Special Diet'];

export default function GuestModal({ isOpen, onClose, guest, onSave }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    group: 'Family',
    category: 'Bride Side',
    status: 'Pending',
    plusOne: false,
    table: '',
    dietary: '',
    mealPreference: '',
    specialRequirements: '',
    invitationSent: false,
    rsvpDate: '',
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        group: guest.group,
        category: guest.category,
        status: guest.status,
        plusOne: guest.plusOne,
        table: guest.table || '',
        dietary: guest.dietary || '',
        mealPreference: guest.mealPreference || '',
        specialRequirements: guest.specialRequirements || '',
        invitationSent: guest.invitationSent || false,
        rsvpDate: guest.rsvpDate || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        group: 'Family',
        category: 'Bride Side',
        status: 'Pending',
        plusOne: false,
        table: '',
        dietary: '',
        mealPreference: '',
        specialRequirements: '',
        invitationSent: false,
        rsvpDate: '',
      });
    }
  }, [guest]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert table to number if it's not empty
    const processedData = {
      ...formData,
      table: formData.table ? parseInt(formData.table, 10) : null,
    };
    onSave(processedData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {guest ? 'Edit Guest' : 'Add New Guest'}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category
                          </label>
                          <select
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            {CATEGORIES.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="group" className="block text-sm font-medium text-gray-700">
                            Group
                          </label>
                          <select
                            name="group"
                            id="group"
                            value={formData.group}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            {GROUPS.map(group => (
                              <option key={group} value={group}>{group}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            RSVP Status
                          </label>
                          <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            {STATUSES.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="table" className="block text-sm font-medium text-gray-700">
                            Table Number
                          </label>
                          <input
                            type="number"
                            name="table"
                            id="table"
                            value={formData.table}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="mealPreference" className="block text-sm font-medium text-gray-700">
                            Meal Preference
                          </label>
                          <select
                            name="mealPreference"
                            id="mealPreference"
                            value={formData.mealPreference}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="">Select a meal</option>
                            {MEAL_OPTIONS.map(meal => (
                              <option key={meal} value={meal}>{meal}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="dietary" className="block text-sm font-medium text-gray-700">
                            Dietary Requirements
                          </label>
                          <input
                            type="text"
                            name="dietary"
                            id="dietary"
                            value={formData.dietary}
                            onChange={handleChange}
                            placeholder="e.g., Gluten-free, Nut allergy"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700">
                          Special Requirements
                        </label>
                        <textarea
                          name="specialRequirements"
                          id="specialRequirements"
                          value={formData.specialRequirements}
                          onChange={handleChange}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Any additional requirements or notes"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="plusOne"
                            id="plusOne"
                            checked={formData.plusOne}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <label htmlFor="plusOne" className="ml-2 block text-sm text-gray-700">
                            Plus One
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="invitationSent"
                            id="invitationSent"
                            checked={formData.invitationSent}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <label htmlFor="invitationSent" className="ml-2 block text-sm text-gray-700">
                            Invitation Sent
                          </label>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="rsvpDate" className="block text-sm font-medium text-gray-700">
                          RSVP Date
                        </label>
                        <input
                          type="date"
                          name="rsvpDate"
                          id="rsvpDate"
                          value={formData.rsvpDate}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          {guest ? 'Update Guest' : 'Add Guest'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
