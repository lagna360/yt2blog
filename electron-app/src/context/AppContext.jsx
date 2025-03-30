import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// API key storage keys
const YOUTUBE_API_KEY = 'yt2blog_youtube_api_key';
const LLM_API_KEY = 'yt2blog_llm_api_key';

// Check if we're running in Electron
const isElectron = window.electron !== undefined;

export const AppProvider = ({ children }) => {
  // API keys state - initialize from Electron store if available, fallback to localStorage
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [llmApiKey, setLlmApiKey] = useState('');
  
  // Load API keys on component mount
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        if (isElectron) {
          // Get keys from Electron store
          const ytKey = await window.electron.getApiKey(YOUTUBE_API_KEY);
          const llmKey = await window.electron.getApiKey(LLM_API_KEY);
          
          setYoutubeApiKey(ytKey || '');
          setLlmApiKey(llmKey || '');
        } else {
          // Fallback to localStorage for non-Electron environments (like development)
          const ytKey = localStorage.getItem(YOUTUBE_API_KEY);
          const llmKey = localStorage.getItem(LLM_API_KEY);
          
          setYoutubeApiKey(ytKey || '');
          setLlmApiKey(llmKey || '');
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    };
    
    loadApiKeys();
  }, []);
  
  // YouTube URLs state
  const [youtubeUrls, setYoutubeUrls] = useState(['']);
  
  // Instruction state
  const [instruction, setInstruction] = useState('');
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('input'); // input, scraping, processing, verifying, complete
  
  // Generation progress tracking
  const [generationProgress, setGenerationProgress] = useState({});
  
  // Helper function to update progress of a specific generation step
  const updateGenerationProgress = (step, status) => {
    setGenerationProgress(prev => ({
      ...prev,
      [step]: status
    }));
  };
  
  // Content states
  const [scrapedContent, setScrapedContent] = useState({});
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [finalArticle, setFinalArticle] = useState('');
  
  // Error state
  const [error, setError] = useState(null);
  
  // Branding toggle - whether to keep or remove original branding
  const [keepBranding, setKeepBranding] = useState(false);
  
  // Add URL field
  const addYoutubeUrl = () => {
    setYoutubeUrls([...youtubeUrls, '']);
  };
  
  // Remove URL field
  const removeYoutubeUrl = (index) => {
    const newUrls = [...youtubeUrls];
    newUrls.splice(index, 1);
    setYoutubeUrls(newUrls.length ? newUrls : ['']);
  };
  
  // Update URL field
  const updateYoutubeUrl = (index, value) => {
    const newUrls = [...youtubeUrls];
    newUrls[index] = value;
    setYoutubeUrls(newUrls);
  };
  
  // Custom setters for API keys that save to Electron store or localStorage when validated
  const setValidatedYoutubeApiKey = async (key) => {
    setYoutubeApiKey(key);
    if (key) {
      if (isElectron) {
        await window.electron.setApiKey(YOUTUBE_API_KEY, key);
      } else {
        localStorage.setItem(YOUTUBE_API_KEY, key);
      }
    }
  };
  
  const setValidatedLlmApiKey = async (key) => {
    setLlmApiKey(key);
    if (key) {
      if (isElectron) {
        await window.electron.setApiKey(LLM_API_KEY, key);
      } else {
        localStorage.setItem(LLM_API_KEY, key);
      }
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setYoutubeUrls(['']);
    setInstruction('');
    setCurrentStep('input');
    setGenerationProgress({});
    setScrapedContent({});
    setGeneratedArticle('');
    setVerificationFeedback('');
    setFinalArticle('');
    setError(null);
    // Don't reset keepBranding as it's a user preference
  };
  
  // Reset everything including API keys
  const resetAll = async () => {
    resetForm();
    // Clear API keys from state
    setYoutubeApiKey('');
    setLlmApiKey('');
    
    // Clear API keys from storage
    if (isElectron) {
      await window.electron.deleteApiKey(YOUTUBE_API_KEY);
      await window.electron.deleteApiKey(LLM_API_KEY);
    } else {
      localStorage.removeItem(YOUTUBE_API_KEY);
      localStorage.removeItem(LLM_API_KEY);
    }
  };
  
  return (
    <AppContext.Provider
      value={{
        youtubeApiKey,
        setYoutubeApiKey,
        setValidatedYoutubeApiKey,
        llmApiKey,
        setLlmApiKey,
        setValidatedLlmApiKey,
        youtubeUrls,
        setYoutubeUrls,
        instruction,
        setInstruction,
        isProcessing,
        setIsProcessing,
        currentStep,
        setCurrentStep,
        generationProgress,
        updateGenerationProgress,
        scrapedContent,
        setScrapedContent,
        generatedArticle,
        setGeneratedArticle,
        verificationFeedback,
        setVerificationFeedback,
        finalArticle,
        setFinalArticle,
        error,
        setError,
        keepBranding,
        setKeepBranding,
        addYoutubeUrl,
        removeYoutubeUrl,
        updateYoutubeUrl,
        resetForm,
        resetAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
