import { useState, useEffect } from 'react';
import {
  PlusIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import GuestModal from '../components/GuestModal';
import TableAssignment from '../components/TableAssignment';

// Move initial guests data to localStorage if it exists
const initialGuests = JSON.parse(localStorage.getItem('guests')) || [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    group: 'Family',
    category: 'Bride Side',
    status: 'Confirmed',
    plusOne: true,
    table: 1,
    dietary: 'Vegetarian',
    mealPreference: 'Chicken',
    specialRequirements: 'Allergy to nuts',
    invitationSent: true,
    rsvpDate: '2024-01-15',
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@example.com',
    group: 'Friends',
    category: 'Groom Side',
    status: 'Pending',
    plusOne: false,
    table: null,
    dietary: null,
    mealPreference: null,
    specialRequirements: '',
    invitationSent: false,
    rsvpDate: null,
  },
];

const CATEGORIES = ['All', 'Bride Side', 'Groom Side', 'Wedding Party', 'Family', 'Friends', 'Colleagues'];
const MEAL_OPTIONS = ['Chicken', 'Fish', 'Vegetarian', 'Vegan', 'Special Diet'];
const RSVP_STATUSES = ['All', 'Confirmed', 'Pending', 'Declined'];

export default function GuestList() {
  const [selectedGuests, setSelectedGuests] = useState(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [tableAssignmentOpen, setTableAssignmentOpen] = useState(false);
  const [guestList, setGuestList] = useState(initialGuests);

  // Save guests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('guests', JSON.stringify(guestList));
  }, [guestList]);

  // Filter guests based on search query, category, and status
  const filteredGuests = guestList.filter(guest => {
    const matchesSearch = 
      guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || guest.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || guest.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Guest statistics
  const stats = {
    total: guestList.length,
    confirmed: guestList.filter(g => g.status === 'Confirmed').length,
    pending: guestList.filter(g => g.status === 'Pending').length,
    declined: guestList.filter(g => g.status === 'Declined').length,
    totalMeals: {
      Chicken: guestList.filter(g => g.mealPreference === 'Chicken').length,
      Fish: guestList.filter(g => g.mealPreference === 'Fish').length,
      Vegetarian: guestList.filter(g => g.mealPreference === 'Vegetarian').length,
      Vegan: guestList.filter(g => g.mealPreference === 'Vegan').length,
      'Special Diet': guestList.filter(g => g.mealPreference === 'Special Diet').length,
    },
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedGuests(new Set(guestList.map(guest => guest.id)));
    } else {
      setSelectedGuests(new Set());
    }
  };

  const handleSelectGuest = (id) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedGuests(newSelected);
  };

  const handleAddGuest = () => {
    setEditingGuest(null);
    setModalOpen(true);
  };

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGuest(null);
  };

  const handleSaveGuest = (guestData) => {
    if (editingGuest) {
      // Update existing guest
      setGuestList(prevGuests =>
        prevGuests.map(g =>
          g.id === editingGuest.id ? { ...guestData, id: editingGuest.id } : g
        )
      );
    } else {
      // Add new guest
      const newGuest = {
        ...guestData,
        id: Math.max(0, ...guestList.map(g => g.id)) + 1,
      };
      setGuestList(prevGuests => [...prevGuests, newGuest]);
    }
    handleCloseModal();
  };

  const handleUpdateTableAssignments = (updatedGuests) => {
    setGuestList(updatedGuests);
  };

  const handleExportCSV = () => {
    // Define CSV headers based on guest fields
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Group',
      'Category',
      'Status',
      'Plus One',
      'Table',
      'Dietary Requirements',
      'Meal Preference',
      'Special Requirements',
      'Invitation Sent',
      'RSVP Date'
    ];

    // Convert guest data to CSV format
    const guestData = guestList.map(guest => [
      guest.firstName,
      guest.lastName,
      guest.email,
      guest.group,
      guest.category,
      guest.status,
      guest.plusOne ? 'Yes' : 'No',
      guest.table || '',
      guest.dietary || '',
      guest.mealPreference || '',
      guest.specialRequirements || '',
      guest.invitationSent ? 'Yes' : 'No',
      guest.rsvpDate || ''
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...guestData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'wedding_guests.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTemplate = () => {
    // Create template with headers and example row
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Group (Family/Friends/Colleagues/Other)',
      'Category (Bride Side/Groom Side/Wedding Party/Family/Friends/Colleagues)',
      'Status (Pending/Confirmed/Declined)',
      'Plus One (Yes/No)',
      'Table Number',
      'Dietary Requirements',
      'Meal Preference (Chicken/Fish/Vegetarian/Vegan/Special Diet)',
      'Special Requirements',
      'Invitation Sent (Yes/No)',
      'RSVP Date (YYYY-MM-DD)'
    ];

    const exampleRow = [
      'John',
      'Smith',
      'john@example.com',
      'Family',
      'Bride Side',
      'Confirmed',
      'Yes',
      '1',
      'Gluten-free',
      'Chicken',
      'Requires wheelchair access',
      'Yes',
      '2024-01-15'
    ];

    // Create CSV content with headers and example
    const csvContent = [
      headers.join(','),
      exampleRow.map(cell => `"${cell}"`).join(',')
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'guest_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n');
        const headers = rows[0].split(',').map(header => 
          header.trim().replace(/^"/, '').replace(/"$/, '')
        );

        // Convert CSV rows to guest objects
        const newGuests = rows.slice(1).map((row, index) => {
          const values = row.split(',').map(value => 
            value.trim().replace(/^"/, '').replace(/"$/, '')
          );
          if (values.length !== headers.length) return null;

          return {
            id: Math.max(0, ...guestList.map(g => g.id)) + index + 1,
            firstName: values[0],
            lastName: values[1],
            email: values[2],
            group: values[3],
            category: values[4],
            status: values[5],
            plusOne: values[6].toLowerCase() === 'yes',
            table: values[7] ? parseInt(values[7], 10) : null,
            dietary: values[8],
            mealPreference: values[9],
            specialRequirements: values[10],
            invitationSent: values[11].toLowerCase() === 'yes',
            rsvpDate: values[12]
          };
        }).filter(guest => guest !== null);

        // Update guest list with new guests
        setGuestList(prevGuests => [...prevGuests, ...newGuests]);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Guest List</h1>
          <p className="text-sm text-gray-500">Manage your wedding guests</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="btn-primary flex items-center"
            onClick={handleAddGuest}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Guest
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:justify-between">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
            >
              {RSVP_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setTableAssignmentOpen(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <TableCellsIcon className="h-5 w-5 mr-2 text-gray-400" />
              Table Assignment
            </button>

            {/* Import Button and Hidden File Input */}
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
                id="csvFileInput"
              />
              <button
                onClick={() => document.getElementById('csvFileInput').click()}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2 text-gray-400" />
                Import CSV
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-400" />
              Export Guest List
            </button>

            <button
              onClick={handleExportTemplate}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-400" />
              Download Template
            </button>

            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
              Send Invites
            </button>
          </div>
        </div>
      </div>

      {/* Guest Statistics */}
      <div className="grid grid-cols-5 gap-4 my-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Guests</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-500">Confirmed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
          <div className="text-sm text-gray-500">Declined</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">
            {guestList.filter(g => g.plusOne).length}
          </div>
          <div className="text-sm text-gray-500">Plus Ones</div>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    onChange={handleSelectAll}
                    checked={selectedGuests.size === filteredGuests.length}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plus One
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No guests found. Add a new guest to get started.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        checked={selectedGuests.has(guest.id)}
                        onChange={() => handleSelectGuest(guest.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {guest.firstName} {guest.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{guest.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{guest.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        guest.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        guest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {guest.table || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {guest.mealPreference || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {guest.plusOne ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditGuest(guest)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          const updatedGuests = guestList.filter(g => g.id !== guest.id);
                          setGuestList(updatedGuests);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest Modal */}
      <GuestModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        guest={editingGuest}
        onSave={handleSaveGuest}
      />

      {/* Table Assignment Modal */}
      <TableAssignment
        isOpen={tableAssignmentOpen}
        onClose={() => setTableAssignmentOpen(false)}
        guests={guestList}
        onUpdateGuests={handleUpdateTableAssignments}
      />
    </div>
  );
}
