import React, { useEffect, useState } from 'react';

const PDFViewer = ({ file, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        // If file is already a blob URL, use it directly
        if (file.startsWith('blob:')) {
          setPdfUrl(file);
          return;
        }
        
        // Otherwise, fetch the file and create a blob URL
        const response = await fetch(file);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();

    // Cleanup
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [file]);

  if (!pdfUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded-lg">
          Loading PDF...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-lg w-full max-w-4xl h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="w-full h-full">
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
