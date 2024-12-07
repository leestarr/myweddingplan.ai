import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';  
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
  TrashIcon,
} from '@heroicons/react/24/outline';
import TaskModal from '../components/TaskModal';
import TaskTimeline from '../components/TaskTimeline';
import TaskProgress from '../components/TaskProgress';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/database';

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

export default function TaskManager() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view, setView] = useState('board');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(CATEGORIES);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Load tasks from Firestore
  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (user) {
          const userTasks = await taskService.getAllTasks(user.uid);
          setTasks(userTasks);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  const handleAddTask = async (taskData) => {
    try {
      const taskId = await taskService.upsertTask(user.uid, {
        ...taskData,
        status: 'todo',
        createdAt: new Date().toISOString()
      });
      
      const newTask = {
        ...taskData,
        id: taskId,
        status: 'todo',
        createdAt: new Date().toISOString()
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      setModalOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await taskService.upsertTask(user.uid, taskData);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskData.id ? { ...task, ...taskData } : task
        )
      );
      setModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      const updatedTasks = Array.from(tasks);
      const [removed] = updatedTasks.splice(source.index, 1);
      updatedTasks.splice(destination.index, 0, {
        ...removed,
        status: destination.droppableId
      });

      setTasks(updatedTasks);

      // Update the task status in Firestore
      await taskService.updateTaskStatus(draggableId, destination.droppableId);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    if (categories.length > 1) {
      const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
      setCategories(updatedCategories);
      if (filterCategory === categoryToDelete) {
        setFilterCategory('All');
      }
    }
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
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
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
            
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-3 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Add Category Button */}
              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>

              {/* Delete Category Button */}
              <button
                type="button"
                onClick={() => handleDeleteCategory(filterCategory)}
                disabled={filterCategory === 'All' || categories.length <= 1}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-colors ${
                  filterCategory === 'All' || categories.length <= 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 hover:text-red-600'
                }`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>

              {/* Add Category Modal */}
              {isAddingCategory && (
                <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <form onSubmit={handleAddCategory} className="p-4">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      autoFocus
                    />
                    <div className="mt-3 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategory('');
                        }}
                        className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newCategory.trim()}
                        className={`rounded px-3 py-1.5 text-sm text-white transition-colors ${
                          newCategory.trim()
                            ? 'bg-primary-500 hover:bg-primary-600'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

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
      <style jsx>{`
        .task-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .task-card:hover {
          transform: translateY(-2px);
        }
        .task-card.dragging {
          transform: scale(1.05) rotate(2deg);
          z-index: 100;
        }
        .droppable-column {
          min-height: 100px;
          transition: background-color 0.2s ease;
        }
      `}</style>

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
                      className={`p-4 droppable-column ${
                        snapshot.isDraggingOver 
                          ? 'bg-primary-50 border-2 border-dashed border-primary-300' 
                          : ''
                      }`}
                    >
                      {getTasksByStatus(column.id).map((task, index) => (
                        <Draggable
                          key={task.id.toString()}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-3 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group ${
                                snapshot.isDragging 
                                  ? 'shadow-lg ring-2 ring-primary-500 ring-opacity-50 rotate-2 scale-105' 
                                  : ''
                              } task-card`}
                            >
                              {/* Drag handle */}
                              <div 
                                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                {...provided.dragHandleProps}
                              >
                                ⋮⋮
                              </div>

                              <div className="flex items-start justify-between space-x-4 pt-4">
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
                                    setEditingTask(task);
                                    setModalOpen(true);
                                  }}
                                  className="flex-shrink-0 p-2.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                  <span className="sr-only">Edit</span>
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                              </div>
                              {provided.placeholder}
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
        <TaskTimeline tasks={filteredTasks} onEditTask={(task) => {
          setEditingTask(task);
          setModalOpen(true);
        }} />
      )}

      {view === 'progress' && (
        <TaskProgress tasks={filteredTasks} />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={editingTask ? handleEditTask : handleAddTask}
        task={editingTask}
        categories={categories}
        priorities={PRIORITIES}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
