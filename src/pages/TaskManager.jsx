import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import TaskModal from '../components/TaskModal';
import TaskTimeline from '../components/TaskTimeline';
import TaskProgress from '../components/TaskProgress';

const PRIORITIES = ['High', 'Medium', 'Low'];
const CATEGORIES = [
  'Ceremony',
  'Reception',
  'Attire',
  'Decor',
  'Catering',
  'Music',
  'Photography',
  'Transportation',
  'Accommodation',
  'Other'
];

const STATUS_COLUMNS = {
  todo: {
    id: 'todo',
    title: 'To Do',
    color: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-700',
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
  },
  review: {
    id: 'review',
    title: 'Review',
    color: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-700',
  },
  completed: {
    id: 'completed',
    title: 'Completed',
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
  }
};

// Get initial tasks from localStorage or use empty array
const initialTasks = JSON.parse(localStorage.getItem('weddingTasks')) || [];

export default function TaskManager() {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view, setView] = useState('board'); // board, timeline, progress
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('weddingTasks', JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Find the task being dragged
    const task = tasks.find(t => t.id.toString() === draggableId);
    if (!task) return;

    // Create a new array without the dragged task
    const newTasks = tasks.filter(t => t.id.toString() !== draggableId);

    // Update the task's status
    const updatedTask = {
      ...task,
      status: destination.droppableId
    };

    // Find all tasks in the destination status
    const tasksInDestination = newTasks.filter(t => t.status === destination.droppableId);

    // Insert the task at the new position
    const finalTasks = [...newTasks];
    const insertAt = finalTasks.findIndex(t => t.status === destination.droppableId) + destination.index;
    finalTasks.splice(insertAt >= 0 ? insertAt : 0, 0, updatedTask);

    setTasks(finalTasks);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      // Update existing task
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === editingTask.id ? { ...taskData, id: editingTask.id } : t
        )
      );
    } else {
      // Add new task
      const newTask = {
        ...taskData,
        id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
    setModalOpen(false);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
  };

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Wedding Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all your wedding planning tasks
          </p>
        </div>
        <button
          onClick={handleAddTask}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Task
        </button>
      </div>

      {/* Filters and Views */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:justify-between">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px]"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('board')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                view === 'board'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                view === 'timeline'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setView('progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                view === 'progress'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Progress
            </button>
          </div>
        </div>
      </div>

      {/* Task Views */}
      {view === 'board' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(STATUS_COLUMNS).map(column => (
              <div
                key={column.id}
                className={`bg-white rounded-lg shadow-sm border ${column.color}`}
              >
                <div className={`px-4 py-3 border-b ${column.color}`}>
                  <h3 className={`font-medium ${column.textColor}`}>
                    {column.title}
                    <span className="ml-2 text-sm">
                      ({getTasksByStatus(column.id).length})
                    </span>
                  </h3>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[200px] transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-gray-50' : ''
                      }`}
                    >
                      {getTasksByStatus(column.id).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging
                                  ? provided.draggableProps.style?.transform
                                  : 'none',
                              }}
                              className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-3 hover:shadow-md transition-all duration-200 ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500 ring-opacity-50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between space-x-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      task.priority === 'High'
                                        ? 'bg-red-100 text-red-700'
                                        : task.priority === 'Medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {task.priority}
                                    </span>
                                    <span className="inline-flex items-center text-xs text-gray-500">
                                      <TagIcon className="h-3.5 w-3.5 mr-1" />
                                      {task.category}
                                    </span>
                                    {task.dueDate && (
                                      <span className="inline-flex items-center text-xs text-gray-500">
                                        <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(task);
                                  }}
                                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-50"
                                >
                                  <span className="sr-only">Edit</span>
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {view === 'timeline' && (
        <TaskTimeline tasks={filteredTasks} onEditTask={handleEditTask} />
      )}

      {view === 'progress' && (
        <TaskProgress tasks={filteredTasks} />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        categories={CATEGORIES}
        priorities={PRIORITIES}
      />
    </div>
  );
}
