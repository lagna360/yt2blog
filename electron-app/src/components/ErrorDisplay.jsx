import { useAppContext } from '../context/AppContext';

const ErrorDisplay = () => {
  const { error, setError } = useAppContext();
  
  if (!error) {
    return null;
  }
  
  return (
    <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6 relative">
      <div className="flex">
        <div className="py-1">
          <svg className="fill-current h-6 w-6 text-red-500 dark:text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 10.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
          </svg>
        </div>
        <div>
          <p className="font-bold">Error</p>
          <p className="text-sm">{error.message || 'An unknown error occurred'}</p>
          {error.context && (
            <p className="text-sm mt-1">
              <span className="font-semibold">Context:</span> {error.context}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => setError(null)}
        className="absolute top-0 right-0 mt-3 mr-4 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        aria-label="Dismiss error"
      >
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default ErrorDisplay;
