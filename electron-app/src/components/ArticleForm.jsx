import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { validateFormInputs } from '../utils/validationUtils';
import { scrapeYoutubeContent } from '../services/youtubeService';
import { generateArticle, verifyArticle } from '../services/llmService';
import { createErrorObject } from '../utils/errorUtils';

const ArticleForm = () => {
  const {
    youtubeApiKey,
    llmApiKey,
    youtubeUrls,
    instruction,
    setIsProcessing,
    setCurrentStep,
    setScrapedContent,
    setGeneratedArticle,
    setVerificationFeedback,
    setFinalArticle,
    generationProgress,
    updateGenerationProgress,
    setError,
    keepBranding,
    setKeepBranding,
    searchInternet,
    setSearchInternet,
    tokenUsages,
    setTokenUsages
  } = useAppContext();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Check if the form is currently being enhanced by monitoring the global state
  useEffect(() => {
    // Get the enhancing state from InstructionInput component
    const checkEnhancingState = () => {
      const enhancingElement = document.querySelector('[data-enhancing="true"]');
      setIsEnhancing(!!enhancingElement);
    };
    
    // Set up an interval to check the enhancing state
    const interval = setInterval(checkEnhancingState, 500);
    
    // Initial check
    checkEnhancingState();
    
    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  // Validate the form inputs whenever they change
  useEffect(() => {
    const formData = {
      youtubeApiKey,
      llmApiKey,
      youtubeUrls,
      instruction
    };
    
    const { isValid } = validateFormInputs(formData);
    setIsFormValid(isValid);
  }, [youtubeApiKey, llmApiKey, youtubeUrls, instruction]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    const formData = {
      youtubeApiKey,
      llmApiKey,
      youtubeUrls,
      instruction
    };
    
    const { isValid, errors } = validateFormInputs(formData);
    
    if (!isValid) {
      // Display the first error
      const firstError = Object.values(errors)[0];
      setError(createErrorObject(
        Array.isArray(firstError) ? firstError[0] : firstError,
        'Validation Error'
      ));
      return;
    }
    
    // Start processing
    setIsSubmitting(true);
    setIsProcessing(true);
    setCurrentStep('scraping');
    setError(null);
    
    try {
      // Step 1: Scrape YouTube content
      const scrapedContent = {};
      
      for (const url of youtubeUrls) {
        if (!url) continue;
        
        try {
          const content = await scrapeYoutubeContent(youtubeApiKey, url);
          scrapedContent[url] = content;
        } catch (error) {
          throw createErrorObject(error, `Failed to scrape content from ${url}`);
        }
      }
      
      setScrapedContent(scrapedContent);
      
      // Step 2: Generate article
      setCurrentStep('processing');
      let article;
      
      // Reset token usage tracking for new generation
      setTokenUsages([]);
      
      try {
        article = await generateArticle(
          llmApiKey, 
          scrapedContent, 
          instruction, 
          updateGenerationProgress, 
          keepBranding, 
          searchInternet, 
          null, // feedback parameter
          (tokenCost) => {
            // Track token usage for cost calculation
            setTokenUsages(prevUsages => [...prevUsages, tokenCost]);
          }
        );
        setGeneratedArticle(article);
      } catch (error) {
        throw createErrorObject(error, 'Failed to generate article');
      }
      
      // Step 3: Set the final article directly without verification step
      // The article returned from generateArticle is already the refined version
      // from the three parallel generations and their criticisms
      setFinalArticle(article);
      
      // Mark process as complete
      setCurrentStep('complete');
      
      // Update all progress indicators to complete
      updateGenerationProgress('final-generation', 'complete');
      
    } catch (error) {
      setError(error);
      setCurrentStep('input');
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 mb-4">
        {/* Options container */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">Article Options</h3>
          
          <div className="flex flex-col space-y-4">
            {/* Toggle Row 1 - Add Citations */}
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="w-24 flex-shrink-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Citations</span>
              </div>
              <div className="relative inline-flex rounded-full bg-gray-200 dark:bg-gray-700 p-0.5 shadow-inner w-44">
                <button
                  type="button"
                  className={`relative z-0 w-1/2 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${!keepBranding 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setKeepBranding(false)}
                >
                  Off
                </button>
                <button
                  type="button"
                  className={`relative z-0 w-1/2 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${keepBranding 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setKeepBranding(true)}
                >
                  On
                </button>
              </div>
            </div>
            
            {/* Toggle Row 2 - Web Search */}
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="w-24 flex-shrink-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Web Search</span>
              </div>
              <div className="relative inline-flex rounded-full bg-gray-200 dark:bg-gray-700 p-0.5 shadow-inner w-44">
                <button
                  type="button"
                  className={`relative z-0 w-1/2 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${!searchInternet 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setSearchInternet(false)}
                >
                  Off
                </button>
                <button
                  type="button"
                  className={`relative z-0 w-1/2 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${searchInternet 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'}`}
                  onClick={() => setSearchInternet(true)}
                >
                  On
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Generate button row */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isEnhancing || !isFormValid}
            className={`px-6 py-2 rounded-md text-white font-medium w-full md:w-auto ${
              isSubmitting || isEnhancing || !isFormValid
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
            } transition-colors flex items-center justify-center`}
          >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              Generate Article
            </>
          )}
        </button>
        </div>
      </div>
    </form>
  );
};

export default ArticleForm;
