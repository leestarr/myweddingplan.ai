import React, { useState } from 'react';

const DocumentViewer = ({ file, onClose }) => {
  const [error, setError] = useState(null);

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
        
        <div className="w-full h-full p-4">
          {error ? (
            <div className="text-center text-red-500">
              <p>Error loading document. Please download to view.</p>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = file;
                  link.download = file.split('/').pop();
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Download Document
              </button>
            </div>
          ) : (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file)}`}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Document Viewer"
            >
              This is an embedded{" "}
              <a target="_blank" href="https://office.com">Microsoft Office</a>{" "}
              document, powered by{" "}
              <a target="_blank" href="https://office.com/webapps">Office</a>
            </iframe>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
