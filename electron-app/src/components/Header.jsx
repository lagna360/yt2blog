import { useAppContext } from '../context/AppContext';

const Header = () => {
  const { currentStep, resetForm, resetAll } = useAppContext();
  
  return (
    <header className="w-full bg-gray-800 dark:bg-gray-900 text-white py-4 shadow-md">
      <div className="w-full max-w-3xl mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">YouTube to Blog</h1>
        
        <div className="flex space-x-2">
          {currentStep !== 'input' && (
            <button
              onClick={resetForm}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              aria-label="Reset form"
            >
              New Article
            </button>
          )}
          
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
