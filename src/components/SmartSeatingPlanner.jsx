import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon, UserGroupIcon, ArrowsRightLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function SmartSeatingPlanner({ isOpen, onClose, guests, onUpdateGuests }) {
  const [numTables, setNumTables] = useState(10);
  const [tableAssignments, setTableAssignments] = useState({});
  const [optimizedSeating, setOptimizedSeating] = useState([]);
  const [unassignedGuests, setUnassignedGuests] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableDetails, setShowTableDetails] = useState(null);
  const [tableNotes, setTableNotes] = useState({});
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

  useEffect(() => {
    if (isOpen) {
      // Initialize table assignments and unassigned guests
      const initialAssignments = {};
      const unassigned = [];
      guests.forEach(guest => {
        if (guest.table) {
          if (!initialAssignments[guest.table]) {
            initialAssignments[guest.table] = [];
          }
          initialAssignments[guest.table].push(guest);
        } else {
          unassigned.push(guest);
        }
      });
      setTableAssignments(initialAssignments);
      setUnassignedGuests(unassigned);
      setOptimizedSeating(Array.from({ length: numTables }, (_, i) => ({
        id: i + 1,
        seats: initialAssignments[i + 1] || [],
        capacity: 8
      })));
    }
  }, [isOpen, guests, numTables]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;

    // Find the guest by ID (handle both string and number IDs)
    const guest = guests.find(g => g.id.toString() === draggableId);
    
    if (!guest) return;
    
    const newSeating = [...optimizedSeating];
    
    // Remove from source
    if (source.droppableId === 'unassigned') {
      setUnassignedGuests(prev => prev.filter(g => g.id.toString() !== draggableId));
    } else {
      const sourceTable = newSeating.find(t => t.id.toString() === source.droppableId);
      if (sourceTable) {
        sourceTable.seats = sourceTable.seats.filter(g => g.id.toString() !== draggableId);
      }
    }
    
    // Add to destination
    if (destination.droppableId === 'unassigned') {
      setUnassignedGuests(prev => [...prev, guest]);
    } else {
      const destTable = newSeating.find(t => t.id.toString() === destination.droppableId);
      if (destTable && destTable.seats.length < destTable.capacity) {
        destTable.seats.splice(destination.index, 0, guest);
      } else {
        // If table is full or not found, put back in original position
        if (source.droppableId === 'unassigned') {
          setUnassignedGuests(prev => [...prev, guest]);
        } else {
          const sourceTable = newSeating.find(t => t.id.toString() === source.droppableId);
          if (sourceTable) {
            sourceTable.seats.splice(source.index, 0, guest);
          }
        }
      }
    }
    
    setOptimizedSeating(newSeating);
  };

  const handleAddNote = (tableId, note) => {
    setTableNotes(prev => ({
      ...prev,
      [tableId]: note
    }));
  };

  const handleSwapTables = (table1Id, table2Id) => {
    const newSeating = [...optimizedSeating];
    const table1 = newSeating.find(t => t.id === table1Id);
    const table2 = newSeating.find(t => t.id === table2Id);
    const temp = [...table1.seats];
    table1.seats = [...table2.seats];
    table2.seats = temp;
    setOptimizedSeating(newSeating);
  };

  const handleApplySeating = () => {
    // Update all guests with their new table assignments
    const updatedGuests = guests.map(guest => {
      const table = optimizedSeating.find(t => t.seats.some(s => s.id === guest.id));
      return {
        ...guest,
        table: table ? table.id : null
      };
    });

    onUpdateGuests(updatedGuests);
    onClose();
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
            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Smart Seating Planner
                </Dialog.Title>

                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setNumTables(prev => Math.max(1, prev - 1))}
                      className="p-2 text-gray-400 hover:text-gray-500"
                      disabled={numTables <= 1}
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-600">
                      {numTables} Tables
                    </span>
                    <button
                      onClick={() => setNumTables(prev => prev + 1)}
                      className="p-2 text-gray-400 hover:text-gray-500"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>

                    <div className="ml-6">
                      <select
                        value={groupingOption}
                        onChange={(e) => setGroupingOption(e.target.value)}
                        className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                      >
                        {GROUP_OPTIONS.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => optimizeSeating()}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Optimize Seating
                    </button>
                    <button
                      onClick={() => handleApplySeating()}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Apply Changes
                    </button>
                  </div>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="flex space-x-4">
                    {/* Unassigned Guests Pool */}
                    <div className="w-64">
                      {Object.entries(getGroupedGuests(unassignedGuests)).map(([groupName, groupGuests]) => (
                        <Droppable key={groupName} droppableId="unassigned">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`mb-4 p-4 rounded-lg ${
                                snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                              }`}
                            >
                              <h4 className="font-medium text-gray-900 mb-2">{groupName}</h4>
                              <div className="space-y-2">
                                {groupGuests.map((guest, index) => (
                                  <Draggable
                                    key={guest.id}
                                    draggableId={guest.id.toString()}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`bg-white p-2 rounded-md shadow-sm ${
                                          snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
                                        }`}
                                      >
                                        <div className="text-sm font-medium">
                                          {guest.firstName} {guest.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {guest.category} • {guest.group}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>

                    {/* Tables Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {optimizedSeating.map((table) => (
                        <Droppable key={table.id} droppableId={table.id.toString()}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`border rounded-lg p-4 ${
                                snapshot.isDraggingOver ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">
                                  Table {table.id}
                                </h4>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setShowTableDetails(table.id === showTableDetails ? null : table.id)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <UserGroupIcon className="h-4 w-4" />
                                  </button>
                                  {selectedTable && selectedTable !== table.id && (
                                    <button
                                      onClick={() => handleSwapTables(selectedTable, table.id)}
                                      className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                      <ArrowsRightLeftIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setSelectedTable(table.id)}
                                    className={`p-1 ${
                                      selectedTable === table.id
                                        ? 'text-primary-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                  >
                                    <UserGroupIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {table.seats.map((guest, index) => (
                                  <Draggable
                                    key={guest.id}
                                    draggableId={guest.id.toString()}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`bg-white p-2 rounded-md shadow-sm ${
                                          snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
                                        }`}
                                      >
                                        <div className="text-sm font-medium">
                                          {guest.firstName} {guest.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {guest.category} • {guest.group}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {table.seats.length < table.capacity && (
                                  <div className="text-sm text-gray-400 italic text-center py-2 border-2 border-dashed border-gray-200 rounded">
                                    Drop guest here
                                  </div>
                                )}
                              </div>

                              {/* Table Details */}
                              {showTableDetails === table.id && (
                                <div className="mt-4 pt-4 border-t">
                                  <div className="text-sm text-gray-600">
                                    <div>Capacity: {table.capacity}</div>
                                    <div>Seats Available: {table.capacity - table.seats.length}</div>
                                    <textarea
                                      className="mt-2 w-full text-sm p-2 border rounded"
                                      placeholder="Add table notes..."
                                      value={tableNotes[table.id] || ''}
                                      onChange={(e) => handleAddNote(table.id, e.target.value)}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  </div>
                </DragDropContext>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
