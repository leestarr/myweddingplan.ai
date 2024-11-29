import { CalendarIcon, UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';

export default function TaskTimeline({ tasks, onEditTask }) {
  // Sort tasks by due date
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Group tasks by month
  const groupedTasks = sortedTasks.reduce((groups, task) => {
    const date = new Date(task.dueDate);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(task);
    return groups;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Timeline View</h2>
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {Object.entries(groupedTasks).map(([monthYear, monthTasks], monthIdx) => (
              <li key={monthYear}>
                <div className="relative pb-8">
                  {monthIdx !== Object.keys(groupedTasks).length - 1 ? (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center ring-8 ring-white">
                        <CalendarIcon className="h-5 w-5 text-primary-600" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-4">{monthYear}</p>
                      </div>
                      <div className="space-y-4">
                        {monthTasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                            onClick={() => onEditTask(task)}
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                task.priority === 'High'
                                  ? 'bg-red-100 text-red-700'
                                  : task.priority === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <TagIcon className="h-4 w-4 mr-1" />
                                {task.category}
                              </div>
                              {task.assignedTo && (
                                <div className="flex items-center">
                                  <UserGroupIcon className="h-4 w-4 mr-1" />
                                  {task.assignedTo}
                                </div>
                              )}
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
