import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { isValidYoutubeApiKeyFormat, isValidLlmApiKeyFormat } from '../utils/validationUtils';
import { validateApiKey as validateLlmApiKey } from '../services/llmService';
import { validateApiKey as validateYoutubeApiKey } from '../services/youtubeService';

const ApiKeyInput = () => {
  const { 
    youtubeApiKey, 
    setYoutubeApiKey, 
    setValidatedYoutubeApiKey,
    llmApiKey, 
    setLlmApiKey, 
    setValidatedLlmApiKey,
    resetAll,
    setError 
  } = useAppContext();
  const [showYoutubeKey, setShowYoutubeKey] = useState(false);
  const [showLlmKey, setShowLlmKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // LLM API key validation states
  const [isValidatingLlmKey, setIsValidatingLlmKey] = useState(false);
  const [llmKeyValidationError, setLlmKeyValidationError] = useState(null);
  const [llmKeyLastValidated, setLlmKeyLastValidated] = useState('');
  
  // YouTube API key validation states
  const [isValidatingYoutubeKey, setIsValidatingYoutubeKey] = useState(false);
  const [youtubeKeyValidationError, setYoutubeKeyValidationError] = useState(null);
  const [youtubeKeyLastValidated, setYoutubeKeyLastValidated] = useState('');
  
  const handleYoutubeApiKeyChange = (e) => {
    setYoutubeApiKey(e.target.value);
    // Clear validation error when user starts typing again
    if (youtubeKeyValidationError) {
      setYoutubeKeyValidationError(null);
    }
  };
  
  const handleLlmApiKeyChange = (e) => {
    setLlmApiKey(e.target.value);
    // Clear validation error when user starts typing again
    if (llmKeyValidationError) {
      setLlmKeyValidationError(null);
    }
  };
  
  const toggleYoutubeKeyVisibility = () => {
    setShowYoutubeKey(!showYoutubeKey);
  };
  
  const toggleLlmKeyVisibility = () => {
    setShowLlmKey(!showLlmKey);
  };
  
  // Validate LLM API key when it changes and user stops typing
  useEffect(() => {
    // Skip validation if key is empty or unchanged
    if (!llmApiKey || llmApiKey === llmKeyLastValidated) {
      return;
    }
    
    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      setIsValidatingLlmKey(true);
      try {
        const isValid = await validateLlmApiKey(llmApiKey);
        if (!isValid) {
          setLlmKeyValidationError('Invalid API key. Please check your key and try again.');
        } else {
          setLlmKeyValidationError(null);
          // Save validated key to localStorage
          setValidatedLlmApiKey(llmApiKey);
        }
      } catch (error) {
        console.error('Error validating LLM API key:', error);
        setLlmKeyValidationError('Error validating API key. Please try again.');
      } finally {
        setIsValidatingLlmKey(false);
        setLlmKeyLastValidated(llmApiKey);
      }
    }, 1000); // Wait 1 second after user stops typing
    
    return () => clearTimeout(timeoutId);
  }, [llmApiKey, llmKeyLastValidated, setValidatedLlmApiKey]);
  
  // Validate YouTube API key when it changes and user stops typing
  useEffect(() => {
    // Skip validation if key is empty or unchanged
    if (!youtubeApiKey || youtubeApiKey === youtubeKeyLastValidated) {
      return;
    }
    
    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      setIsValidatingYoutubeKey(true);
      try {
        const isValid = await validateYoutubeApiKey(youtubeApiKey);
        if (!isValid) {
          setYoutubeKeyValidationError('Invalid YouTube API key. Please check your key and try again.');
        } else {
          setYoutubeKeyValidationError(null);
          // Save validated key to localStorage
          setValidatedYoutubeApiKey(youtubeApiKey);
        }
      } catch (error) {
        console.error('Error validating YouTube API key:', error);
        setYoutubeKeyValidationError('Error validating YouTube API key. Please try again.');
      } finally {
        setIsValidatingYoutubeKey(false);
        setYoutubeKeyLastValidated(youtubeApiKey);
      }
    }, 1000); // Wait 1 second after user stops typing
    
    return () => clearTimeout(timeoutId);
  }, [youtubeApiKey, youtubeKeyLastValidated, setValidatedYoutubeApiKey]);
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none"
            aria-expanded={isExpanded}
            aria-label="Toggle configuration section"
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>Configuration</h2>
        </div>
        {isExpanded && (
          <button
            onClick={resetAll}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded shadow-sm transition-colors"
          >
            Reset Keys
          </button>
        )}
      </div>
      
      {!isExpanded && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          <p>Set up your API keys {(youtubeApiKey || llmApiKey) && !youtubeKeyValidationError && !llmKeyValidationError && 
            <span className="text-green-600 dark:text-green-400">• Keys validated ✓</span>}
          </p>
        </div>
      )}
      
      {isExpanded && (
        <>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-5 min-h-[2.5rem]">
            <p>Your API keys are stored securely on your device and are never sent to any server.</p>
            {(youtubeApiKey || llmApiKey) && !youtubeKeyValidationError && !llmKeyValidationError && 
              <p className="mt-1 text-green-600 dark:text-green-400">Validated keys are saved securely.</p>
            }
          </div>
          
          <div className="grid grid-cols-1 gap-5">
        {/* YouTube API Key */}
        <div>
          <label 
            htmlFor="youtubeApiKey" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            YouTube API Key
          </label>
          <div className="relative">
            <input
              id="youtubeApiKey"
              type={showYoutubeKey ? "text" : "password"}
              value={youtubeApiKey}
              onChange={handleYoutubeApiKeyChange}
              placeholder="Enter your YouTube API key"
              className={`w-full px-4 py-2.5 rounded-md border ${
                youtubeKeyValidationError
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
              disabled={isValidatingYoutubeKey}
            />
            <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
              {isValidatingYoutubeKey && (
                <svg className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {!isValidatingYoutubeKey && youtubeApiKey && youtubeKeyLastValidated === youtubeApiKey && !youtubeKeyValidationError && (
                <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <button
              type="button"
              onClick={toggleYoutubeKeyVisibility}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 dark:text-gray-400"
            >
              {showYoutubeKey ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
          <div className="h-6 mt-1">
            {youtubeKeyValidationError && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {youtubeKeyValidationError}
              </p>
            )}
            {isValidatingYoutubeKey && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Validating YouTube API key...
              </p>
            )}
          </div>
        </div>
        
        {/* LLM API Key */}
        <div>
          <label 
            htmlFor="llmApiKey" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            LLM API Key
          </label>
          <div className="relative">
            <input
              id="llmApiKey"
              type={showLlmKey ? "text" : "password"}
              value={llmApiKey}
              onChange={handleLlmApiKeyChange}
              placeholder="Enter your LLM API key"
              className={`w-full px-4 py-2.5 rounded-md border ${
                llmKeyValidationError
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
              disabled={isValidatingLlmKey}
            />
            <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
              {isValidatingLlmKey && (
                <svg className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {!isValidatingLlmKey && llmApiKey && llmKeyLastValidated === llmApiKey && !llmKeyValidationError && (
                <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <button
              type="button"
              onClick={toggleLlmKeyVisibility}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 dark:text-gray-400"
            >
              {showLlmKey ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
          <div className="h-6 mt-1">
            {llmKeyValidationError && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {llmKeyValidationError}
              </p>
            )}
            {isValidatingLlmKey && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Validating API key...
              </p>
            )}
          </div>
        </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApiKeyInput;
