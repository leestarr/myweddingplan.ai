import { useState, useEffect } from 'react';

export const useWeddingDate = () => {
  const [weddingDate, setWeddingDate] = useState(null);

  useEffect(() => {
    // Get wedding date from localStorage or your app's state management
    const savedDate = localStorage.getItem('weddingDate');
    if (savedDate) {
      setWeddingDate(new Date(savedDate));
    }
  }, []);

  return weddingDate;
};

export default useWeddingDate;
