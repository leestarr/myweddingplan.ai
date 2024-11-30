import React, { useState, useRef, useMemo } from 'react';
import PDFViewer from '../components/PDFViewer';
import DocumentViewer from '../components/DocViewer';
import { PlusIcon, DocumentIcon, XMarkIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const QuoteTypes = {
  PDF: 'pdf',
  WORD: 'docx',
  EMAIL: 'email'
};

const statusOptions = ['All', 'Pending', 'Accepted', 'Rejected', 'Reviewing'];

export default function Quotes() {
  const fileInputRef = useRef(null);
  const [quotes, setQuotes] = useState([
    {
      id: 1,
      title: 'Elegant Events Venue Quote',
      type: QuoteTypes.PDF,
      date: '2024-02-15',
      status: 'Pending',
      amount: '$5,000',
      vendor: 'Elegant Events',
      location: '123 Wedding Lane, Beverly Hills',
      time: '4:00 PM - 11:00 PM',
      guestNumber: 150,
      quantity: 1,
      description: 'Full venue rental including indoor and outdoor spaces',
      url: '/sample.pdf'
    },
    {
      id: 2,
      title: 'Floral Fantasy Proposal',
      type: QuoteTypes.WORD,
      date: '2024-02-14',
      status: 'Accepted',
      amount: '$2,500',
      vendor: 'Floral Fantasy',
      location: '456 Floral St, Los Angeles',
      time: '10:00 AM - 5:00 PM',
      guestNumber: 100,
      quantity: 1,
      description: 'Custom floral arrangements for wedding ceremony and reception',
      url: '/proposal.docx'
    },
    {
      id: 3,
      title: 'Catering Service Quote',
      type: QuoteTypes.EMAIL,
      date: '2024-02-13',
      status: 'Reviewing',
      amount: '$3,800',
      vendor: 'Tasty Bites Catering',
      location: '789 Catering St, San Francisco',
      time: '12:00 PM - 8:00 PM',
      guestNumber: 200,
      quantity: 1,
      description: 'Full-service catering for wedding reception',
      content: 'Email content here...'
    }
  ]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'vendor'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false);
  const [newQuote, setNewQuote] = useState({
    title: '',
    vendor: '',
    amount: '',
    location: '',
    time: '',
    guestNumber: '',
    description: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    type: '',
    url: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const filteredAndSortedQuotes = useMemo(() => {
    return quotes
      .filter(quote => {
        const matchesSearch = 
          quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quote.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || quote.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'date':
            comparison = new Date(b.date) - new Date(a.date);
            break;
          case 'amount':
            comparison = parseFloat(b.amount.replace('$', '').replace(',', '')) - 
                        parseFloat(a.amount.replace('$', '').replace(',', ''));
            break;
          case 'vendor':
            comparison = a.vendor.localeCompare(b.vendor);
            break;
          default:
            comparison = 0;
        }
        return sortOrder === 'asc' ? -comparison : comparison;
      });
  }, [quotes, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleQuoteClick = (quote) => {
    setSelectedQuote(quote);
    setShowQuoteDetails(true);
  };

  const handleViewDocument = (e, quote) => {
    e.stopPropagation(); // Prevent card click
    setSelectedQuote(quote);
    
    // If it's a newly added quote with a file object
    if (quote.file) {
      const fileUrl = URL.createObjectURL(quote.file);
      setSelectedQuote({ ...quote, url: fileUrl });
    }
    
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedQuote(null);
    // Clean up any object URLs we created
    if (selectedQuote?.file) {
      URL.revokeObjectURL(selectedQuote.url);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type === 'application/pdf' ? QuoteTypes.PDF :
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? QuoteTypes.WORD :
                    null;

    if (!fileType) {
      alert('Please upload a PDF or Word document');
      return;
    }

    const fileUrl = URL.createObjectURL(file);

    const newQuote = {
      id: quotes.length ? Math.max(...quotes.map(q => q.id)) + 1 : 1,
      title: file.name.replace(/\.[^/.]+$/, ""),
      type: fileType,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      amount: 'TBD',
      vendor: '',
      location: '',
      time: '',
      guestNumber: 0,
      quantity: 1,
      description: '',
      url: fileUrl,
      file: file
    };

    setQuotes(prev => [...prev, newQuote]);
    setSelectedQuote(newQuote);
    setShowQuoteDetails(true);
  };

  const handleAddQuote = (e) => {
    e.preventDefault();
    const fileType = selectedFile?.type.includes('pdf') ? QuoteTypes.PDF :
                    selectedFile?.type.includes('word') || selectedFile?.type.includes('docx') ? QuoteTypes.WORD :
                    QuoteTypes.EMAIL;
    
    // Create a local URL for the file and store the file itself
    const fileUrl = selectedFile ? URL.createObjectURL(selectedFile) : '';
    
    const newQuoteWithId = {
      ...newQuote,
      id: quotes.length + 1,
      type: fileType,
      url: fileUrl,
      file: selectedFile // Store the actual file object
    };

    setQuotes([...quotes, newQuoteWithId]);
    setNewQuote({
      title: '',
      vendor: '',
      amount: '',
      location: '',
      time: '',
      guestNumber: '',
      description: '',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      type: '',
      url: ''
    });
    setSelectedFile(null);
    setShowAddQuoteModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const updateQuote = (updatedQuote) => {
    setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
    setSelectedQuote(updatedQuote);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
          <button
            onClick={() => setShowAddQuoteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Quote
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotes by title, vendor, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-shrink-0">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <FunnelIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="vendor">Sort by Vendor</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Quote Modal */}
      {showAddQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Add New Quote</h2>
              <button
                onClick={() => setShowAddQuoteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddQuote} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newQuote.title}
                    onChange={(e) => setNewQuote({ ...newQuote, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quote title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={newQuote.vendor}
                    onChange={(e) => setNewQuote({ ...newQuote, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter vendor name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="text"
                      value={newQuote.amount}
                      onChange={(e) => setNewQuote({ ...newQuote, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest Number
                    </label>
                    <input
                      type="number"
                      value={newQuote.guestNumber}
                      onChange={(e) => setNewQuote({ ...newQuote, guestNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter guest count"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newQuote.location}
                    onChange={(e) => setNewQuote({ ...newQuote, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newQuote.time}
                    onChange={(e) => setNewQuote({ ...newQuote, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter time"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newQuote.description}
                    onChange={(e) => setNewQuote({ ...newQuote, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Document
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddQuoteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotes Grid */}
      {filteredAndSortedQuotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No quotes found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedQuotes.map((quote) => (
            <div
              key={quote.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow relative bg-white flex flex-col h-[500px]"
            >
              {/* Header Section */}
              <div className="flex items-start justify-between gap-2 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={quote.title}
                      onChange={(e) => updateQuote({ ...quote, title: e.target.value })}
                      className="font-semibold text-lg bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full truncate"
                      placeholder="Enter title"
                    />
                    <button
                      onClick={(e) => handleViewDocument(e, quote)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 flex-shrink-0"
                      title="View Document"
                    >
                      <DocumentIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <select
                  value={quote.status}
                  onChange={(e) => updateQuote({ ...quote, status: e.target.value })}
                  className={`px-2 py-1 rounded text-sm border-0 focus:ring-2 focus:ring-offset-2 cursor-pointer flex-shrink-0 ${
                    quote.status === 'Accepted' ? 'bg-green-100 text-green-800 focus:ring-green-500' :
                    quote.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500' :
                    'bg-blue-100 text-blue-800 focus:ring-blue-500'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Content Section */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                <div className="space-y-4">
                  <div className="quote-field-group">
                    <label className="text-gray-500 text-sm block">Vendor</label>
                    <input
                      type="text"
                      value={quote.vendor}
                      onChange={(e) => updateQuote({ ...quote, vendor: e.target.value })}
                      placeholder="Enter vendor name"
                      className="w-full bg-transparent border-b border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none py-1 px-0 text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="quote-field-group">
                      <label className="text-gray-500 text-sm block">Amount</label>
                      <input
                        type="text"
                        value={quote.amount}
                        onChange={(e) => updateQuote({ ...quote, amount: e.target.value })}
                        placeholder="Enter amount"
                        className="w-full bg-transparent border-b border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none py-1 px-0 text-gray-900"
                      />
                    </div>
                    <div className="quote-field-group">
                      <label className="text-gray-500 text-sm block">Guests</label>
                      <input
                        type="number"
                        value={quote.guestNumber}
                        onChange={(e) => updateQuote({ ...quote, guestNumber: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full bg-transparent border-b border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none py-1 px-0 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="quote-field-group">
                    <label className="text-gray-500 text-sm block">Location</label>
                    <input
                      type="text"
                      value={quote.location}
                      onChange={(e) => updateQuote({ ...quote, location: e.target.value })}
                      placeholder="Enter location"
                      className="w-full bg-transparent border-b border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none py-1 px-0 text-gray-900"
                    />
                  </div>

                  <div className="quote-field-group">
                    <label className="text-gray-500 text-sm block">Time</label>
                    <input
                      type="text"
                      value={quote.time}
                      onChange={(e) => updateQuote({ ...quote, time: e.target.value })}
                      placeholder="Enter time"
                      className="w-full bg-transparent border-b border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none py-1 px-0 text-gray-900"
                    />
                  </div>

                  <div className="quote-field-group">
                    <label className="text-gray-500 text-sm block">Notes</label>
                    <textarea
                      value={quote.description}
                      onChange={(e) => updateQuote({ ...quote, description: e.target.value })}
                      placeholder="Enter description"
                      rows={3}
                      className="w-full bg-transparent border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded-md resize-none p-2 text-sm text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-right">
                <span className="text-sm text-gray-500">
                  Added: {new Date(quote.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Details Modal */}
      {showQuoteDetails && selectedQuote && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Quote Details</h2>
              <button onClick={closeQuoteDetails} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={selectedQuote.title}
                      onChange={(e) => updateQuote({ ...selectedQuote, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vendor</label>
                    <input
                      type="text"
                      value={selectedQuote.vendor}
                      onChange={(e) => updateQuote({ ...selectedQuote, vendor: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="text"
                      value={selectedQuote.amount}
                      onChange={(e) => updateQuote({ ...selectedQuote, amount: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={selectedQuote.location}
                      onChange={(e) => updateQuote({ ...selectedQuote, location: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="text"
                      value={selectedQuote.time}
                      onChange={(e) => updateQuote({ ...selectedQuote, time: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Guest Number</label>
                    <input
                      type="number"
                      value={selectedQuote.guestNumber}
                      onChange={(e) => updateQuote({ ...selectedQuote, guestNumber: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedQuote.status}
                      onChange={(e) => updateQuote({ ...selectedQuote, status: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={selectedQuote.description}
                      onChange={(e) => updateQuote({ ...selectedQuote, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={(e) => handleViewDocument(e, selectedQuote)}
                  className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                  <DocumentIcon className="h-5 w-5 mr-2" />
                  View Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showViewer && selectedQuote && (
        selectedQuote.type === QuoteTypes.PDF ? (
          <PDFViewer
            file={selectedQuote.url}
            onClose={handleCloseViewer}
          />
        ) : selectedQuote.type === QuoteTypes.WORD ? (
          <DocumentViewer
            file={selectedQuote.url}
            onClose={handleCloseViewer}
          />
        ) : null
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.docx,.doc"
        className="hidden"
      />
    </div>
  );
}
