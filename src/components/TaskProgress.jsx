import { ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function TaskProgress({ tasks }) {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Group tasks by category
  const categoryStats = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = {
        total: 0,
        completed: 0,
        highPriority: 0,
      };
    }
    acc[task.category].total += 1;
    if (task.status === 'completed') {
      acc[task.category].completed += 1;
    }
    if (task.priority === 'High') {
      acc[task.category].highPriority += 1;
    }
    return acc;
  }, {});

  // Priority breakdown
  const priorityStats = tasks.reduce((acc, task) => {
    if (!acc[task.priority]) {
      acc[task.priority] = 0;
    }
    acc[task.priority] += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600">Total Tasks</p>
                <p className="mt-1 text-2xl font-semibold text-primary-900">{totalTasks}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed Tasks</p>
                <p className="mt-1 text-2xl font-semibold text-green-900">{completedTasks}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600">Completion Rate</p>
                <p className="mt-1 text-2xl font-semibold text-primary-900">
                  {completionRate.toFixed(1)}%
                </p>
              </div>
              <div className="h-8 w-8 rounded-full border-4 border-primary-200">
                <div
                  className="h-full w-full rounded-full border-4 border-primary-500"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% ${completionRate}%, 0 ${completionRate}%)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress by Category</h2>
        <div className="space-y-4">
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">{category}</h3>
                <span className="text-sm text-gray-500">
                  {stats.completed} / {stats.total} completed
                </span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{
                      width: `${(stats.completed / stats.total) * 100}%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{((stats.completed / stats.total) * 100).toFixed(1)}% Complete</span>
                <span>{stats.highPriority} High Priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(priorityStats).map(([priority, count]) => (
            <div
              key={priority}
              className={`rounded-lg p-4 ${
                priority === 'High'
                  ? 'bg-red-50'
                  : priority === 'Medium'
                  ? 'bg-yellow-50'
                  : 'bg-green-50'
              }`}
            >
              <p className={`text-sm font-medium ${
                priority === 'High'
                  ? 'text-red-700'
                  : priority === 'Medium'
                  ? 'text-yellow-700'
                  : 'text-green-700'
              }`}>
                {priority} Priority
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{count}</p>
              <p className="mt-1 text-sm text-gray-500">
                {((count / totalTasks) * 100).toFixed(1)}% of total
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
