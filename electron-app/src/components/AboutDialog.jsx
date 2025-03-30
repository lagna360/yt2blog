import { useState, useEffect } from 'react';

const AboutDialog = ({ onClose }) => {
  const [appVersion, setAppVersion] = useState('1.0.0');
  
  // Get app version from Electron if available
  useEffect(() => {
    const getVersion = async () => {
      if (window.electron) {
        try {
          const version = await window.electron.getAppVersion();
          if (version) {
            setAppVersion(version);
          }
        } catch (error) {
          console.error('Failed to get app version:', error);
        }
      }
    };
    
    getVersion();
  }, []);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">About YouTube to Blog</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4 text-gray-600 dark:text-gray-300">
          <p className="mb-3">
            <span className="font-semibold">Version:</span> {appVersion}
          </p>
          
          <p className="mb-3">
            YouTube to Blog is a desktop application that helps you convert YouTube videos into blog articles using AI.
          </p>
          
          <p className="mb-3">
            All processing happens locally on your computer. Your API keys are stored securely in your app's local storage and are never sent to any server.
          </p>
          
          <h3 className="font-semibold mt-4 mb-2">Features:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Convert YouTube videos to blog articles</li>
            <li>Customize output with instructions</li>
            <li>Process multiple videos at once</li>
            <li>Export in markdown format</li>
            <li>Dark mode support</li>
          </ul>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;
