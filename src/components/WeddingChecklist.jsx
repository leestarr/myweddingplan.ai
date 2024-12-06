import { useState, useEffect } from 'react';
import { generateResponse } from '../config/gemini';
import { CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function WeddingChecklist() {
  const [weddingDate, setWeddingDate] = useState('');
  const [weddingStyle, setWeddingStyle] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load checklist from localStorage
  useEffect(() => {
    const savedChecklist = localStorage.getItem('weddingChecklist');
    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    }
  }, []);

  // Save checklist to localStorage whenever it changes
  useEffect(() => {
    if (checklist.length > 0) {
      localStorage.setItem('weddingChecklist', JSON.stringify(checklist));
    }
  }, [checklist]);

  const generateChecklist = async () => {
    if (!weddingDate || !weddingStyle) {
      setError('Please fill in both wedding date and style');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Generate a detailed wedding planning checklist for a ${weddingStyle} wedding on ${weddingDate}. 
      Format the response as a JSON array of objects, where each object has:
      - task (string): The task description
      - timeline (string): When this should be done (e.g., "12 months before", "6 months before", etc.)
      - category (string): Category of the task (e.g., "Venue", "Attire", "Catering", etc.)
      - completed (boolean): Should be false by default
      Please ensure tasks are organized chronologically and include all major planning aspects.`;

      const response = await generateResponse(prompt);
      const parsedChecklist = JSON.parse(response);
      setChecklist(parsedChecklist);
    } catch (error) {
      console.error('Error generating checklist:', error);
      setError('Failed to generate checklist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = (index) => {
    setChecklist(prevChecklist => {
      const newChecklist = [...prevChecklist];
      newChecklist[index] = {
        ...newChecklist[index],
        completed: !newChecklist[index].completed
      };
      return newChecklist;
    });
  };

  const calculateProgress = () => {
    if (checklist.length === 0) return 0;
    const completedTasks = checklist.filter(task => task.completed).length;
    return Math.round((completedTasks / checklist.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Wedding Checklist Generator</h2>
        
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wedding Date
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wedding Style
            </label>
            <select
              value={weddingStyle}
              onChange={(e) => setWeddingStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a style</option>
              <option value="Traditional">Traditional</option>
              <option value="Modern">Modern</option>
              <option value="Rustic">Rustic</option>
              <option value="Beach">Beach</option>
              <option value="Destination">Destination</option>
              <option value="Minimalist">Minimalist</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateChecklist}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate Checklist'}
        </button>

        {error && (
          <p className="text-red-600 mt-2">{error}</p>
        )}
      </div>

      {/* Progress Bar */}
      {checklist.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Progress</h3>
            <span className="text-sm font-medium text-gray-600">
              {calculateProgress()}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Checklist */}
      {checklist.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Your Wedding Checklist</h3>
          <div className="space-y-4">
            {checklist.map((task, index) => (
              <div
                key={index}
                className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <button
                  onClick={() => toggleTaskCompletion(index)}
                  className={`flex-shrink-0 w-5 h-5 mt-1 mr-4 rounded-full border-2 ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {task.completed && (
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  )}
                </button>
                <div className="flex-grow">
                  <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.task}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{task.timeline}</span>
                    <span className="mx-2">•</span>
                    <span>{task.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
