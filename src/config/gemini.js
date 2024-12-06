import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');

if (!API_KEY) {
  throw new Error('Gemini API key not found. Please check your .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const WEDDING_CONTEXT = `You are a helpful and knowledgeable wedding planning assistant. Your goal is to help users plan their perfect wedding by providing expert advice, creative ideas, and practical solutions. Keep responses concise, friendly, and focused on the user's specific needs. When suggesting vendors or services, provide general guidance rather than specific recommendations. Always consider budget constraints and cultural preferences when giving advice.`;

export async function generateResponse(prompt) {
  try {
    console.log('Attempting to generate response with prompt:', prompt);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const chat = model.startChat({
      history: [
        {
          role: 'model',
          parts: WEDDING_CONTEXT,
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Detailed error generating response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}
