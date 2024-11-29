import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

export default function TableAssignment({ isOpen, onClose, guests, onUpdateGuests }) {
  const [numTables, setNumTables] = useState(10);
  const [selectedTable, setSelectedTable] = useState(null);
  const [draggedGuest, setDraggedGuest] = useState(null);
  const [localGuests, setLocalGuests] = useState(guests);

  // Update local guests when props change
  useEffect(() => {
    setLocalGuests(guests);
  }, [guests]);

  const tables = Array.from({ length: numTables }, (_, i) => i + 1);
  
  const getGuestsAtTable = (tableNumber) => {
    return localGuests.filter(guest => guest.table === tableNumber);
  };

  const handleDragStart = (guest) => {
    setDraggedGuest(guest);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (tableNumber) => {
    if (draggedGuest) {
      const updatedGuests = localGuests.map(g =>
        g.id === draggedGuest.id ? { ...g, table: tableNumber } : g
      );
      setLocalGuests(updatedGuests);
      onUpdateGuests(updatedGuests);
      setDraggedGuest(null);
    }
  };

  const handleRemoveFromTable = (guest) => {
    const updatedGuests = localGuests.map(g =>
      g.id === guest.id ? { ...g, table: null } : g
    );
    setLocalGuests(updatedGuests);
    onUpdateGuests(updatedGuests);
  };

  const handleAddTable = () => {
    setNumTables(prev => prev + 1);
  };

  const handleRemoveTable = () => {
    if (numTables > 1) {
      setNumTables(prev => prev - 1);
    }
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Table Assignments
                    </Dialog.Title>

                    {/* Table Controls */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleRemoveTable}
                          className="p-2 text-gray-400 hover:text-gray-500"
                          disabled={numTables <= 1}
                        >
                          <MinusIcon className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-gray-600">
                          {numTables} Tables
                        </span>
                        <button
                          onClick={handleAddTable}
                          className="p-2 text-gray-400 hover:text-gray-500"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        Drag and drop guests to assign tables
                      </div>
                    </div>

                    <div className="flex space-x-6">
                      {/* Unassigned Guests */}
                      <div className="w-64 flex-shrink-0">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Unassigned Guests
                          </h4>
                          <div className="space-y-2">
                            {localGuests.filter(g => !g.table).map(guest => (
                              <div
                                key={guest.id}
                                draggable
                                onDragStart={() => handleDragStart(guest)}
                                className="bg-white p-2 rounded border border-gray-200 shadow-sm cursor-move"
                              >
                                <div className="text-sm font-medium text-gray-900">
                                  {guest.firstName} {guest.lastName}
                                </div>
                                {guest.dietary && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {guest.dietary}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tables Grid */}
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        {tables.map((tableNumber) => {
                          const tableGuests = getGuestsAtTable(tableNumber);
                          return (
                            <div
                              key={tableNumber}
                              className="border border-gray-200 rounded-lg p-4"
                              onDragOver={handleDragOver}
                              onDrop={() => handleDrop(tableNumber)}
                            >
                              <div className="font-medium text-gray-900 mb-2">
                                Table {tableNumber}
                                <span className="text-sm text-gray-500 ml-2">
                                  ({tableGuests.length} guests)
                                </span>
                              </div>
                              <div className="space-y-2">
                                {tableGuests.map((guest) => (
                                  <div
                                    key={guest.id}
                                    draggable
                                    onDragStart={() => handleDragStart(guest)}
                                    className="text-sm text-gray-600 flex items-center justify-between bg-white p-2 rounded border border-gray-200 shadow-sm cursor-move"
                                  >
                                    <span>{guest.firstName} {guest.lastName}</span>
                                    {guest.dietary && (
                                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                        {guest.dietary}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleRemoveFromTable(guest)}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                {tableGuests.length === 0 && (
                                  <div className="text-sm text-gray-500 italic">
                                    Drop guests here
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
