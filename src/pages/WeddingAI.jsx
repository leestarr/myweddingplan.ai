import { useState, useEffect } from 'react';
import { SparklesIcon, ChatBubbleLeftIcon, PhotoIcon, DocumentTextIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { generateResponse } from '../config/gemini';
import WeddingChecklist from '../components/WeddingChecklist';

const AI_FEATURES = [
  {
    id: 'planner',
    name: 'Wedding Planning Assistant',
    description: 'Get personalized advice and recommendations for your wedding planning journey',
    icon: ChatBubbleLeftIcon,
    comingSoon: false,
    suggestedPrompts: [
      "Help me create a wedding planning timeline",
      "What should I consider when choosing a wedding venue?",
      "Give me ideas for a spring wedding color palette",
      "What are some unique wedding favor ideas?",
      "Help me plan a wedding within a $20,000 budget"
    ]
  },
  {
    id: 'checklist',
    name: 'Wedding Checklist Generator',
    description: 'Generate and track your personalized wedding planning checklist',
    icon: DocumentTextIcon,
    comingSoon: false,
    component: 'checklist'
  },
  {
    id: 'vision',
    name: 'Vision Board Creator',
    description: 'Use AI to create and curate your wedding vision board',
    icon: PhotoIcon,
    comingSoon: true,
    suggestedPrompts: []
  },
  {
    id: 'documents',
    name: 'Document Generator',
    description: 'Generate customized wedding documents, timelines, and checklists',
    icon: DocumentTextIcon,
    comingSoon: true,
    suggestedPrompts: []
  },
];

export default function WeddingAI() {
  const [selectedFeature, setSelectedFeature] = useState(AI_FEATURES[0]);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('weddingAIMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('weddingAIMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    const userMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await generateResponse(prompt);
      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setError('Sorry, there was an error generating a response. Please try again.');
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setPrompt(prompt);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Wedding AI</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your AI-powered wedding planning assistant
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Features List */}
        <div className="lg:col-span-1 space-y-4">
          {AI_FEATURES.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setSelectedFeature(feature)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedFeature.id === feature.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              disabled={feature.comingSoon}
            >
              <div className="flex items-center">
                <feature.icon className="h-6 w-6 mr-3 text-blue-600" />
                <div>
                  <h3 className="font-medium">{feature.name}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                  {feature.comingSoon && (
                    <span className="inline-block mt-1 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Feature Content */}
        <div className="lg:col-span-3">
          {selectedFeature.component === 'checklist' ? (
            <WeddingChecklist />
          ) : (
            <>
              {/* Chat Interface */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 text-gray-500">
                        Thinking...
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="flex justify-center">
                      <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">
                        {error}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Prompts */}
                {selectedFeature.suggestedPrompts.length > 0 && !isLoading && messages.length === 0 && (
                  <div className="border-t border-gray-200 p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Suggested Questions</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFeature.suggestedPrompts.map((suggestedPrompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedPrompt(suggestedPrompt)}
                          className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
                        >
                          {suggestedPrompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={clearChat}
                      className="text-sm text-gray-500 hover:text-gray-700"
                      disabled={messages.length === 0}
                    >
                      Clear Chat
                    </button>
                    {messages.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {messages.length} messages
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleSubmit} className="flex space-x-4">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={`Ask anything about ${selectedFeature.name.toLowerCase()}...`}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>Send</span>
                      {isLoading && (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
