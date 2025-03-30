import { useAppContext } from '../context/AppContext';

const ProcessingStatus = () => {
  const { currentStep, isProcessing } = useAppContext();
  
  // Define the steps in the process
  const steps = [
    { id: 'input', label: 'Input' },
    { id: 'scraping', label: 'Scraping Videos' },
    { id: 'processing', label: 'Generating Article' },
    { id: 'complete', label: 'Complete' }
  ];
  
  // Determine the current step index
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  // Only show if we're past the input step
  if (currentStep === 'input') {
    return null;
  }
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Processing Status</h2>
      
      <div className="relative">
        {/* Progress bar */}
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-300 dark:bg-gray-700">
          <div 
            style={{ 
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%` 
            }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-600 transition-all duration-500"
          />
        </div>
        
        {/* Steps */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  index < currentStepIndex 
                    ? 'bg-green-500 dark:bg-green-600' 
                    : index === currentStepIndex && currentStep !== 'complete'
                      ? 'bg-blue-500 dark:bg-blue-600 animate-pulse' 
                      : index === currentStepIndex && currentStep === 'complete'
                        ? 'bg-green-500 dark:bg-green-600'
                        : 'bg-gray-300 dark:bg-gray-700'
                } text-white text-sm font-medium`}
              >
                {index < currentStepIndex ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`mt-2 text-xs ${
                index === currentStepIndex && currentStep !== 'complete'
                  ? 'font-medium text-blue-600 dark:text-blue-400' 
                  : currentStep === 'complete' && index === currentStepIndex
                    ? 'font-medium text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Status message */}
      <div className="mt-6 text-center">
        {isProcessing && (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700 dark:text-gray-300">
              {currentStep === 'scraping' && 'Scraping video content...'}
              {currentStep === 'processing' && 'Generating articles in parallel...'}
              {currentStep === 'verifying' && 'Creating refined article from multiple versions...'}
            </span>
          </div>
        )}
        
        {currentStep === 'complete' && (
          <div className="text-green-600 dark:text-green-400 font-medium flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Article generation complete!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingStatus;
