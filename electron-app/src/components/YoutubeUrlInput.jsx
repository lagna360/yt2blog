import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { isValidYoutubeUrl } from '../services/youtubeService';

const YoutubeUrlInput = () => {
  const { 
    youtubeUrls, 
    addYoutubeUrl, 
    removeYoutubeUrl, 
    updateYoutubeUrl 
  } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none"
            aria-expanded={isExpanded}
            aria-label="Toggle YouTube URLs section"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>YouTube URLs</h2>
        </div>
      </div>
      
      {!isExpanded && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          <p>{youtubeUrls.filter(url => url && isValidYoutubeUrl(url)).length} valid YouTube URLs added</p>
        </div>
      )}
      
      {isExpanded && (
        <>
          <div className="space-y-4">
            {youtubeUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                  placeholder="Enter YouTube URL"
                  className={`flex-1 px-4 py-2.5 rounded-md border ${
                    url && !isValidYoutubeUrl(url)
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
                />
                
                <button
                  type="button"
                  onClick={() => removeYoutubeUrl(index)}
                  disabled={youtubeUrls.length === 1}
                  className={`p-2 rounded-md ${
                    youtubeUrls.length === 1
                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                  } text-white transition-colors`}
                  aria-label="Remove URL"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            
            {youtubeUrls.some(url => url && !isValidYoutubeUrl(url)) && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                Please enter valid YouTube URLs
              </p>
            )}
          </div>
          
          <button
            type="button"
            onClick={addYoutubeUrl}
            className="mt-5 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors flex items-center shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Another URL
          </button>
        </>
      )}
    </div>
  );
};

export default YoutubeUrlInput;
