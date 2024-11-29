import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChatBubbleLeftIcon, PaperClipIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const messages = [
  {
    id: 1,
    author: 'Sarah Miller',
    role: 'Wedding Planner',
    time: '12:45 PM',
    content: 'New venue options are available for review.',
    attachment: {
      name: 'Venue_Options.pdf',
      size: '2.5 MB',
    },
  },
  {
    id: 2,
    author: 'John Davis',
    role: 'Photographer',
    time: '11:30 AM',
    content: 'Updated the photoshoot schedule for next week.',
  },
];

const tasks = [
  { id: 1, name: 'Book Venue', priority: 'High', dueDate: '2024-03-01' },
  { id: 2, name: 'Send Invitations', priority: 'Medium', dueDate: '2024-03-15' },
  { id: 3, name: 'Order Flowers', priority: 'Low', dueDate: '2024-04-01' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome to your wedding planning dashboard</p>
        </div>
        <button className="btn-primary">Add New Task</button>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-primary-600">150</div>
          <div className="text-sm text-gray-500">Total Guests</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-primary-600">75%</div>
          <div className="text-sm text-gray-500">Tasks Complete</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-primary-600">$25k</div>
          <div className="text-sm text-gray-500">Budget</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-primary-600">180</div>
          <div className="text-sm text-gray-500">Days Left</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Recent Messages</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${message.author}`}
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{message.author}</h3>
                        <p className="text-xs text-gray-500">{message.role}</p>
                      </div>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{message.content}</p>
                    {message.attachment && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                        <PaperClipIcon className="h-4 w-4" />
                        <span>{message.attachment.name}</span>
                        <span>({message.attachment.size})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Outstanding Tasks</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-900">{task.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'High'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-sm text-gray-500">{task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">Budget Overview</h2>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: ['Venue', 'Catering', 'Decor', 'Music', 'Photo'],
                datasets: [
                  {
                    label: 'Spent',
                    data: [8000, 5000, 3000, 2000, 1500],
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  },
                  {
                    label: 'Budget',
                    data: [10000, 6000, 4000, 2500, 2000],
                    backgroundColor: 'rgba(147, 197, 253, 0.5)',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Timeline or Calendar Placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">Upcoming Events</h2>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>Calendar integration coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
