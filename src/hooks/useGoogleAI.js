import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export function useGoogleAI() {
  const [error, setError] = useState(null);

  const generateContent = useCallback(async (prompt) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_AI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    generateContent,
    error,
  };
}
