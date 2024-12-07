import { useState } from 'react';
import { 
  PencilIcon, 
  PhotoIcon, 
  CalendarIcon, 
  QuestionMarkCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { generateResponse } from '../config/gemini';

export default function WebsiteContentGenerator() {
  const [activeTab, setActiveTab] = useState('story');
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState({
    story: '',
    schedule: [],
    faqs: [],
    selectedPhotos: []
  });

  const tabs = [
    { id: 'story', name: 'Our Story', icon: PencilIcon },
    { id: 'photos', name: 'Photos', icon: PhotoIcon },
    { id: 'schedule', name: 'Schedule', icon: CalendarIcon },
    { id: 'faqs', name: 'FAQs', icon: QuestionMarkCircleIcon },
  ];

  const generateStoryPrompt = async (details) => {
    setIsLoading(true);
    try {
      const prompt = `Write a romantic and engaging "Our Story" section for a wedding website with these details:
      - How we met: ${details.howWeMet}
      - First date: ${details.firstDate}
      - The proposal: ${details.proposal}
      Make it personal, warm, and around 300 words. Include some humor and memorable moments.`;

      const response = await generateResponse(prompt);
      setContent(prev => ({ ...prev, story: response }));
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFAQs = async () => {
    setIsLoading(true);
    try {
      const prompt = `Generate a comprehensive FAQ section for a wedding website. Include questions about:
      - Dress code
      - Parking and transportation
      - Accommodation
      - Gift registry
      - Children and plus-ones
      - Dietary restrictions
      - Weather considerations
      Format as a JSON array of objects with 'question' and 'answer' fields.`;

      const response = await generateResponse(prompt);
      const faqs = JSON.parse(response);
      setContent(prev => ({ ...prev, faqs }));
    } catch (error) {
      console.error('Error generating FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePhotos = async (photos) => {
    setIsLoading(true);
    try {
      // In a real implementation, we would use AI vision to analyze photos
      // For now, we'll just store the selected photos
      setContent(prev => ({ ...prev, selectedPhotos: photos }));
    } catch (error) {
      console.error('Error analyzing photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSchedule = async (eventDetails) => {
    setIsLoading(true);
    try {
      const prompt = `Create a detailed wedding day schedule with these events:
      ${JSON.stringify(eventDetails)}
      Format as a JSON array of objects with 'time', 'event', and 'details' fields.
      Include buffer times and transitions between events.`;

      const response = await generateResponse(prompt);
      const schedule = JSON.parse(response);
      setContent(prev => ({ ...prev, schedule }));
    } catch (error) {
      console.error('Error generating schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'story':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Our Story</h3>
              <button
                onClick={() => generateStoryPrompt({
                  howWeMet: "at a coffee shop",
                  firstDate: "dinner and movie",
                  proposal: "beach sunset"
                })}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Generate Story
              </button>
            </div>
            <textarea
              value={content.story}
              onChange={(e) => setContent(prev => ({ ...prev, story: e.target.value }))}
              className="w-full h-96 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Write your love story here or click 'Generate Story' to create one automatically..."
            />
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Photo Gallery</h3>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => analyzePhotos(Array.from(e.target.files))}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer"
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                Upload Photos
              </label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {content.selectedPhotos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Wedding photo ${index + 1}`}
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Wedding Day Schedule</h3>
              <button
                onClick={() => generateSchedule([
                  { event: "Ceremony", time: "2:00 PM" },
                  { event: "Reception", time: "5:00 PM" }
                ])}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Generate Schedule
              </button>
            </div>
            <div className="space-y-2">
              {content.schedule.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-primary-100 rounded-full">
                      <CalendarIcon className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{item.time}</p>
                    <p className="text-gray-600">{item.event}</p>
                    <p className="text-sm text-gray-500">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'faqs':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
              <button
                onClick={generateFAQs}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Generate FAQs
              </button>
            </div>
            <div className="space-y-4">
              {content.faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                  <p className="mt-2 text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                    group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium
                  `}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
