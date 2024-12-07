import { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center z-50`}
      role="alert"
    >
      <span className="mr-2">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        ×
      </button>
    </div>
  );
};

export const useToast = () => {
  const [toastRoot, setToastRoot] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    // Remove existing toast if any
    if (toastRoot) {
      toastRoot.unmount();
    }

    // Create container for toast
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    setToastRoot(root);

    // Render toast
    const handleClose = () => {
      root.unmount();
      container.remove();
      setToastRoot(null);
    };

    root.render(
      <Toast 
        message={message} 
        type={type} 
        onClose={handleClose}
      />
    );

    // Auto-close after 3 seconds
    setTimeout(handleClose, 3000);
  }, [toastRoot]);

  return { showToast };
};
