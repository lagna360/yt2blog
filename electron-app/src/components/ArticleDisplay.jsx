import { useAppContext } from '../context/AppContext';
import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { summarizeTokenUsage, formatCost } from '../services/tokenPricingService';

const ArticleDisplay = () => {
  const { 
    currentStep, 
    finalArticle, 
    generatedArticle, 
    verificationFeedback, 
    iterationCount,
    tokenUsages
  } = useAppContext();
  
  // Only using rich text mode now
  const [displayMode] = useState('rich');
  const [copySuccess, setCopySuccess] = useState('');
  const articleRef = useRef(null);
  
  // Clear copy success message after 3 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);
  
  // Only show if we're in the complete step
  if (currentStep !== 'complete') {
    return null;
  }
  
  const articleContent = finalArticle || generatedArticle;
  
  // Convert markdown to HTML with enhanced styling for rich text
  const getHtmlContent = () => {
    if (!articleContent) return '';
    
    // Configure marked options for better heading IDs and other features
    marked.setOptions({
      headerIds: true,
      breaks: true
    });
    
    // Preprocess the markdown content to handle ** for titles
    let processedContent = articleContent;
    
    // Split into lines to process each line
    const lines = processedContent.split('\n');
    let inList = false;
    
    // Process each line
    const processedLines = lines.map((line, index) => {
      // Check if this is a standalone line with ** at beginning and end (title)
      if (line.trim().startsWith('**') && line.trim().endsWith('**') && !inList) {
        const titleText = line.trim().replace(/^\*\*|\*\*$/g, '');
        
        // Check if it's the first title in the document (main title)
        if (index === 0 || (index > 0 && lines.slice(0, index).every(l => !l.trim().startsWith('**')))) {
          // This is the main title - convert to h1
          return '# ' + titleText;
        } else if (index > 0 && lines[index-1].trim() === 'Key Features' || 
                  titleText === 'Key Features' || 
                  titleText === 'Introduction' || 
                  titleText === 'Benefits' || 
                  titleText === 'Conclusion') {
          // This is a major section heading - convert to h2
          return '## ' + titleText;
        } else {
          // This is a subsection heading - convert to h3
          return '### ' + titleText;
        }
      } else if (line.trim() === 'Introduction' || 
                line.trim() === 'Key Features' || 
                line.trim() === 'Benefits' || 
                line.trim() === 'Conclusion') {
        // These are major section headings without ** - convert to h2
        return '## ' + line.trim();
      }
      
      // Track if we're in a list to avoid converting list items with ** to headings
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || 
          line.trim().startsWith('1. ')) {
        inList = true;
      } else if (line.trim() === '') {
        inList = false;
      }
      
      return line;
    });
    
    // Join back into a single string
    processedContent = processedLines.join('\n');
    
    // Convert markdown to HTML
    const rawHtml = marked(processedContent);
    
    // Wrap with additional styling
    return `<div class="rich-text-content">
      <style>
        .rich-text-content h1 { 
          font-size: 2.25rem; 
          font-weight: 800; 
          margin-top: 0.5rem;
          margin-bottom: 1.75rem; 
          color: var(--tw-prose-headings);
          line-height: 1.2;
        }
        .rich-text-content h2 { 
          font-size: 1.75rem; 
          font-weight: 700; 
          margin-top: 2rem;
          margin-bottom: 1rem; 
          color: var(--tw-prose-headings);
          line-height: 1.3;
        }
        .rich-text-content h3 { 
          font-size: 1.35rem; 
          font-weight: 600; 
          margin-top: 1.5rem;
          margin-bottom: 0.75rem; 
          color: var(--tw-prose-headings);
          line-height: 1.4;
        }
        .rich-text-content p { 
          margin-bottom: 1.2rem; 
          line-height: 1.6;
        }
        .rich-text-content ul, .rich-text-content ol { 
          margin-top: 0.5rem;
          margin-bottom: 1rem; 
          padding-left: 1.5rem;
        }
        .rich-text-content li { 
          margin-bottom: 0.5rem; 
        }
        .rich-text-content hr { 
          margin: 2rem 0; 
          border-top: 1px solid #e5e7eb;
        }
        .rich-text-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          margin: 1.5rem 0;
        }
        .dark .rich-text-content blockquote {
          border-left-color: #4b5563;
        }
      </style>
      ${rawHtml}
    </div>`;
  };
  
  // We've removed the HTML fragment and formatArticle functions as they're no longer needed
  
  // Copy content to clipboard
  const copyToClipboard = () => {
    let contentToCopy = getHtmlContent();
    
    navigator.clipboard.writeText(contentToCopy)
      .then(() => {
        setCopySuccess(`Copied ${displayMode} content!`);
      })
      .catch(err => {
        console.error('Failed to copy article: ', err);
        setCopySuccess('Failed to copy');
      });
  };
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Final Article
      </h2>
      

      
      {/* Only using rich text mode now */}
      
      <div 
        ref={articleRef}
        className="prose prose-lg w-full dark:prose-invert bg-white dark:bg-gray-900 p-6 rounded-md shadow-sm article-container"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .article-container :is(h1:first-child) {
            font-size: 3rem !important;
            margin-top: 0 !important;
            font-weight: 800 !important;
            line-height: 1.1 !important;
            margin-bottom: 2.5rem !important;
            color: var(--tw-prose-headings) !important;
          }
          .article-container h2 {
            font-size: 1.75rem !important;
            font-weight: 700 !important;
            margin-top: 2rem !important;
            margin-bottom: 1rem !important;
            color: var(--tw-prose-headings) !important;
          }
          .article-container h3 {
            font-size: 1.35rem !important;
            font-weight: 600 !important;
            margin-top: 1.5rem !important;
            color: var(--tw-prose-headings) !important;
          }
          .article-container strong {
            font-weight: 600 !important;
          }
        `}} />
        <div dangerouslySetInnerHTML={{ __html: getHtmlContent() }} />
      </div>
      
      {currentStep === 'complete' && (
        <>
          {/* Token usage and cost stats */}
          {tokenUsages && tokenUsages.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">API Usage Statistics</h4>
              
              {(() => {
                const stats = summarizeTokenUsage(tokenUsages);
                return (
                  <>
                    {/* Summary section */}
                    <div className="bg-white dark:bg-gray-800 rounded p-3 mb-3 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-gray-600 dark:text-gray-300">Total Input Tokens:</div>
                        <div className="text-right font-mono font-medium">{stats.totalInputTokens.toLocaleString()}</div>
                        
                        <div className="text-gray-600 dark:text-gray-300">Total Output Tokens:</div>
                        <div className="text-right font-mono font-medium">{stats.totalOutputTokens.toLocaleString()}</div>
                        
                        <div className="text-gray-600 dark:text-gray-300">Total Tokens:</div>
                        <div className="text-right font-mono font-medium">{stats.totalTokens.toLocaleString()}</div>
                        
                        <div className="text-gray-600 dark:text-gray-300 font-medium">Estimated Total Cost:</div>
                        <div className="text-right font-mono font-medium text-blue-600 dark:text-blue-400">{formatCost(stats.totalCost)}</div>
                      </div>
                    </div>
                    
                    {/* Detailed API calls section */}
                    <h5 className="text-gray-700 dark:text-gray-300 font-medium mb-2">Itemized API Calls</h5>
                    <div className="bg-white dark:bg-gray-800 rounded p-2 overflow-auto max-h-64 shadow-sm">
                      <table className="w-full text-xs">
                        <thead className="border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="text-left py-2 px-1 font-medium text-gray-600 dark:text-gray-400">Operation</th>
                            <th className="text-center py-2 px-1 font-medium text-gray-600 dark:text-gray-400">Model</th>
                            <th className="text-right py-2 px-1 font-medium text-gray-600 dark:text-gray-400">Input</th>
                            <th className="text-right py-2 px-1 font-medium text-gray-600 dark:text-gray-400">Output</th>
                            <th className="text-right py-2 px-1 font-medium text-gray-600 dark:text-gray-400">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.detailedUsage.map((usage, index) => (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-1.5 px-1 text-gray-700 dark:text-gray-300">{usage.operation || 'API Call'}</td>
                              <td className="py-1.5 px-1 text-center text-gray-600 dark:text-gray-400 font-mono text-xs">{usage.model}</td>
                              <td className="py-1.5 px-1 text-right text-gray-600 dark:text-gray-400 font-mono">{usage.inputTokens.toLocaleString()}</td>
                              <td className="py-1.5 px-1 text-right text-gray-600 dark:text-gray-400 font-mono">{usage.outputTokens.toLocaleString()}</td>
                              <td className="py-1.5 px-1 text-right text-blue-600 dark:text-blue-400 font-mono">{formatCost(usage.cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          
          {/* Copy button row */}
          <div className="mt-4 flex flex-wrap justify-between items-center">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              {copySuccess}
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copy {displayMode === 'rich' ? 'Rich Text' : displayMode === 'markdown' ? 'Markdown' : 'HTML Fragment'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleDisplay;
