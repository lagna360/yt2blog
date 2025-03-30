import { useEffect, useState } from 'react';
import ApiKeyInput from './ApiKeyInput';
import YoutubeUrlInput from './YoutubeUrlInput';
import InstructionInput from './InstructionInput';
import ArticleForm from './ArticleForm';
import ProcessingStatus from './ProcessingStatus';
import ProcessingFlowChart from './ProcessingFlowChart';
import ArticleDisplay from './ArticleDisplay';
import ErrorDisplay from './ErrorDisplay';
import AboutDialog from './AboutDialog';
import { useAppContext } from '../context/AppContext';

const MainPage = () => {
  const { currentStep, resetForm } = useAppContext();
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log('MainPage rendered, currentStep:', currentStep);
  }, [currentStep]);

  // Register menu event handlers
  useEffect(() => {
    console.log('Setting up menu handlers, window.electron available:', !!window.electron);
    // Check if we're running in Electron
    if (window.electron) {
      // Handle "New Article" menu action
      window.electron.onMenuNewArticle(() => {
        resetForm();
        setStatusMessage('New article started');
      });

      // Handle "About" menu action
      window.electron.onMenuShowAbout(() => {
        setShowAboutDialog(true);
        setStatusMessage('About dialog opened');
      });
    }
  }, [resetForm]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="flex-grow w-full pt-4">
        <div className="w-full max-w-7xl mx-auto px-6 pb-6">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">YouTube to Blog</h1>
            <div className="flex space-x-3">
              <button 
                onClick={resetForm} 
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors" 
                aria-label="Reset form"
              >
                New Article
              </button>
            </div>
          </div>
          <ErrorDisplay />
          <ProcessingStatus />
          {(currentStep === 'processing' || currentStep === 'complete') && (
            <ProcessingFlowChart />
          )}
          
          {currentStep === 'input' && (
            <div className="w-full mx-auto">
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
                  YouTube to Blog Generator
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl">
                  Enter YouTube URLs and instructions to generate a high-quality article
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left column for API keys and YouTube URLs */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold mb-2 text-gray-200">Configuration</h2>
                    <p className="text-sm text-gray-400 mb-4">Set up your API keys and YouTube sources</p>
                  </div>
                  <ApiKeyInput />
                  <YoutubeUrlInput />
                </div>
                
                {/* Right column for Instructions and Article Form */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold mb-2 text-gray-200">Content Generation</h2>
                    <p className="text-sm text-gray-400 mb-4">Customize how your article will be written</p>
                  </div>
                  <InstructionInput />
                  <ArticleForm />
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 'complete' && (
            <div className="w-full mx-auto">
              <ArticleDisplay />
            </div>
          )}
        </div>
      </main>
      
      {/* Status bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 py-1.5 mt-auto border-t border-gray-200 dark:border-gray-700">
        <div className="w-full max-w-7xl mx-auto px-6 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
          <div>{statusMessage}</div>
          <div>YouTube to Blog Generator • API keys stored locally</div>
        </div>
      </div>
      
      {/* About Dialog */}
      {showAboutDialog && (
        <AboutDialog onClose={() => setShowAboutDialog(false)} />
      )}
    </div>
  );
};

export default MainPage;
