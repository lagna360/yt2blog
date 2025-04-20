import { useAppContext } from '../context/AppContext';

const Header = () => {
  const { currentStep, resetForm, resetAll, editInputs } = useAppContext();
  
  return (
    <header className="w-full bg-gray-800 dark:bg-gray-900 text-white py-4 shadow-md">
      <div className="w-full max-w-3xl mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">YouTube to Blog</h1>
        
        <div className="flex space-x-2">
          {/* Buttons are always visible, but disabled when on input step */}
          <>
            <button
              onClick={resetForm}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                currentStep === 'input'
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  : 'bg-gray-700 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
              aria-label="Reset form"
              disabled={currentStep === 'input'}
            >
              New Article
            </button>
            <button
              onClick={editInputs}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                currentStep === 'input'
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  : 'bg-blue-700 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600'
              }`}
              aria-label="Edit inputs"
              disabled={currentStep === 'input'}
            >
              Edit Inputs
            </button>
          </>
          
          <button
            onClick={resetAll}
            className="px-3 py-1 text-sm bg-red-700 hover:bg-red-600 rounded-md transition-colors"
            aria-label="Reset everything including API keys"
          >
            Reset All
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
