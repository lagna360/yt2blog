import { useState } from 'react';
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
    setKeepBranding
  } = useAppContext();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      
      try {
        article = await generateArticle(llmApiKey, scrapedContent, instruction, updateGenerationProgress, keepBranding);
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Branding:</span>
            <div className="relative inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${!keepBranding 
                  ? 'bg-red-600 text-white dark:bg-red-700' 
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setKeepBranding(false)}
              >
                Remove
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${keepBranding 
                  ? 'bg-green-600 text-white dark:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setKeepBranding(true)}
              >
                Keep
              </button>
            </div>
          </div>
        </div>
        <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md text-white font-medium ${
            isSubmitting
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
          } transition-colors flex items-center`}
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
