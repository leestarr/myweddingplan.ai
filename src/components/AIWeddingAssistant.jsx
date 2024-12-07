import { useState } from 'react';
import { 
  SparklesIcon, 
  PaintBrushIcon, 
  MusicalNoteIcon, 
  CakeIcon,
  UserGroupIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { generateResponse } from '../config/gemini';

export default function AIWeddingAssistant() {
  const [activeFeature, setActiveFeature] = useState('styleGuide');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const features = [
    {
      id: 'styleGuide',
      name: 'Style Guide Generator',
      description: 'Generate a cohesive wedding style guide based on your preferences',
      icon: PaintBrushIcon,
      prompt: (preferences) => `Create a comprehensive wedding style guide with these preferences:
        Theme: ${preferences.theme}
        Season: ${preferences.season}
        Colors: ${preferences.colors}
        Include recommendations for:
        - Color palette with hex codes
        - Decor elements and materials
        - Floral arrangements
        - Typography suggestions
        - Lighting recommendations
        Format the response as a structured guide with clear sections.`
    },
    {
      id: 'musicPlaylist',
      name: 'Music Playlist Curator',
      description: 'Get AI-curated song suggestions for different wedding moments',
      icon: MusicalNoteIcon,
      prompt: (details) => `Create a wedding music playlist for these moments:
        Ceremony Type: ${details.ceremonyType}
        Reception Style: ${details.receptionStyle}
        Must-have Genres: ${details.genres}
        Include song suggestions for:
        - Ceremony entrance
        - First dance
        - Parent dances
        - Dinner music
        - Dance floor hits
        For each song, provide: title, artist, and why it's appropriate for that moment.`
    },
    {
      id: 'menuPlanner',
      name: 'Menu Planning Assistant',
      description: 'Generate personalized menu suggestions and dietary accommodations',
      icon: CakeIcon,
      prompt: (requirements) => `Create a wedding menu plan considering:
        Guest Count: ${requirements.guestCount}
        Dietary Restrictions: ${requirements.dietaryRestrictions}
        Season: ${requirements.season}
        Budget Level: ${requirements.budget}
        Include suggestions for:
        - Appetizers/Canapés
        - Main Course options
        - Vegetarian/Vegan alternatives
        - Dessert options
        - Beverage recommendations
        - Late night snacks
        Consider dietary restrictions and seasonal ingredients.`
    },
    {
      id: 'seatingArrangement',
      name: 'Smart Seating Planner',
      description: 'Get AI suggestions for optimal guest seating arrangements',
      icon: UserGroupIcon,
      prompt: (guests) => `Create an optimal seating arrangement for:
        Total Tables: ${guests.tables}
        Guests per Table: ${guests.perTable}
        Special Considerations: ${guests.specialConsiderations}
        Consider:
        - Family dynamics
        - Age groups
        - Common interests
        - Special needs
        Provide table-by-table breakdown with reasoning.`
    },
    {
      id: 'vowGenerator',
      name: 'Vow Writing Assistant',
      description: 'Get help crafting personal and meaningful wedding vows',
      icon: HeartIcon,
      prompt: (details) => `Help create personalized wedding vows considering:
        Relationship Length: ${details.relationshipLength}
        Key Moments: ${details.keyMoments}
        Partner's Qualities: ${details.qualities}
        Style Preference: ${details.style}
        Create vows that:
        - Are personal and specific
        - Include meaningful promises
        - Balance emotion with humor
        - Are appropriate for the ceremony
        Provide a structured draft with options for customization.`
    }
  ];

  const generateContent = async (feature, inputs) => {
    setIsLoading(true);
    setError(null);
    try {
      const prompt = feature.prompt(inputs);
      const response = await generateResponse(prompt);
      setResult(response);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFeatureContent = () => {
    const feature = features.find(f => f.activeFeature === activeFeature);
    
    switch (activeFeature) {
      case 'styleGuide':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Wedding Style Guide</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Theme (e.g., Rustic, Modern)"
                className="input-field"
              />
              <input
                type="text"
                placeholder="Season"
                className="input-field"
              />
              <input
                type="text"
                placeholder="Preferred Colors"
                className="input-field"
              />
            </div>
            <button
              onClick={() => generateContent(feature, {
                theme: 'Modern',
                season: 'Summer',
                colors: 'Blue, Gold'
              })}
              className="btn-primary"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate Style Guide
            </button>
          </div>
        );

      case 'musicPlaylist':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Music Playlist Curator</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Ceremony Type"
                className="input-field"
              />
              <input
                type="text"
                placeholder="Reception Style"
                className="input-field"
              />
              <input
                type="text"
                placeholder="Preferred Genres"
                className="input-field"
              />
            </div>
            <button
              onClick={() => generateContent(feature, {
                ceremonyType: 'Traditional',
                receptionStyle: 'Party',
                genres: 'Pop, Rock, Jazz'
              })}
              className="btn-primary"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate Playlist
            </button>
          </div>
        );

      // Add similar sections for other features...

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`
                p-4 rounded-lg border-2 text-left
                ${activeFeature === feature.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200'
                }
              `}
            >
              <Icon className="h-6 w-6 text-primary-500 mb-2" />
              <h3 className="font-medium">{feature.name}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : (
          <>
            {renderFeatureContent()}
            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap">{result}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
