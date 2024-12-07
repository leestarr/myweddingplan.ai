import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

export default function TableAssignment({ isOpen, onClose, guests, onUpdateGuests }) {
  const [numTables, setNumTables] = useState(10);
  const [selectedTable, setSelectedTable] = useState(null);
  const [draggedGuest, setDraggedGuest] = useState(null);
  const [localGuests, setLocalGuests] = useState(guests);
  const [groupingOption, setGroupingOption] = useState('none');

  const GROUP_OPTIONS = [
    { id: 'none', name: 'No Grouping' },
    { id: 'category', name: 'By Category (Bride/Groom Side)' },
    { id: 'group', name: 'By Group (Family/Friends)' },
    { id: 'status', name: 'By RSVP Status' }
  ];

  // Function to group guests based on selected option
  const getGroupedGuests = (guestList) => {
    if (groupingOption === 'none') return { 'All Guests': guestList };

    return guestList.reduce((groups, guest) => {
      const groupKey = groupingOption === 'category' ? guest.category :
                      groupingOption === 'group' ? guest.group :
                      groupingOption === 'status' ? guest.status :
                      'Other';
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(guest);
      return groups;
    }, {});
  };

  // Update local guests when props change
  useEffect(() => {
    setLocalGuests(guests);
  }, [guests]);

  const tables = Array.from({ length: numTables }, (_, i) => i + 1);
  
  const getGuestsAtTable = (tableNumber) => {
    return localGuests.filter(guest => guest.table === tableNumber);
  };

  const getUnassignedGuests = () => {
    return localGuests.filter(guest => !guest.table);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-6 pb-6 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <div className="mt-2 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                      Table Assignments
                    </Dialog.Title>

                    {/* Table Controls */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-8">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handleRemoveTable}
                            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
                            disabled={numTables <= 1}
                          >
                            <MinusIcon className="h-5 w-5" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 min-w-[80px] text-center">
                            {numTables} Tables
                          </span>
                          <button
                            onClick={handleAddTable}
                            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-3">
                          <label htmlFor="grouping" className="text-sm font-medium text-gray-700">
                            Group by:
                          </label>
                          <select
                            id="grouping"
                            value={groupingOption}
                            onChange={(e) => setGroupingOption(e.target.value)}
                            className="block w-56 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                          >
                            {GROUP_OPTIONS.map(option => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
                        Drag and drop guests to assign tables
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                      {/* Unassigned Guests Column */}
                      <div className="bg-gray-50 p-4 rounded-lg max-h-[calc(100vh-300px)] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-4 sticky top-0 bg-gray-50 py-2">Unassigned Guests</h3>
                        {Object.entries(getGroupedGuests(getUnassignedGuests())).map(([groupName, groupGuests]) => (
                          <div key={groupName} className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-3 text-sm">
                              {groupName}
                              <span className="text-gray-500 ml-2">({groupGuests.length})</span>
                            </h4>
                            <div className="space-y-2">
                              {groupGuests.map(guest => (
                                <div
                                  key={guest.id}
                                  draggable
                                  onDragStart={() => handleDragStart(guest)}
                                  className="bg-white p-3 rounded-md shadow-sm cursor-move hover:shadow-md transition-shadow border border-gray-100"
                                >
                                  <div className="font-medium text-gray-900">{guest.firstName} {guest.lastName}</div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <span>{guest.category}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span>{guest.group}</span>
                                    {guest.dietary && (
                                      <>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="text-primary-600">{guest.dietary}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tables Grid */}
                      <div className="col-span-3 grid grid-cols-3 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {tables.map((tableNumber) => {
                          const tableGuests = getGuestsAtTable(tableNumber);
                          return (
                            <div
                              key={tableNumber}
                              className="border border-gray-200 rounded-lg p-4 bg-white hover:border-primary-100 transition-colors"
                              onDragOver={handleDragOver}
                              onDrop={() => handleDrop(tableNumber)}
                            >
                              <div className="font-medium text-gray-900 mb-3 flex items-center justify-between">
                                <span>Table {tableNumber}</span>
                                <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                  {tableGuests.length} guests
                                </span>
                              </div>
                              <div className="space-y-2">
                                {tableGuests.map((guest) => (
                                  <div
                                    key={guest.id}
                                    draggable
                                    onDragStart={() => handleDragStart(guest)}
                                    className="text-sm bg-white p-3 rounded-md shadow-sm cursor-move hover:shadow-md transition-shadow border border-gray-100 group"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900">
                                        {guest.firstName} {guest.lastName}
                                      </span>
                                      <button
                                        onClick={() => handleRemoveFromTable(guest)}
                                        className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    {(guest.dietary || guest.category || guest.group) && (
                                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                        {guest.category && <span>{guest.category}</span>}
                                        {guest.group && (
                                          <>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{guest.group}</span>
                                          </>
                                        )}
                                        {guest.dietary && (
                                          <>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="text-primary-600">{guest.dietary}</span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {tableGuests.length === 0 && (
                                  <div className="text-sm text-gray-400 italic text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
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
