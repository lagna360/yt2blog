import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { enhanceInstructions } from '../services/llmService';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const InstructionInput = () => {
  const { instruction, setInstruction, llmApiKey } = useAppContext();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState('');
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  
  const handleEnhanceInstructions = async () => {
    if (!instruction || instruction.trim().length < 10) {
      setEnhanceError('Please provide a basic instruction first (at least 10 characters)');
      return;
    }
    
    if (!llmApiKey) {
      setEnhanceError('Please enter your OpenAI API key first');
      return;
    }
    
    try {
      setIsEnhancing(true);
      setEnhanceError('');
      
      const enhancedInstruction = await enhanceInstructions(llmApiKey, instruction);
      setInstruction(enhancedInstruction);
    } catch (error) {
      console.error('Error enhancing instructions:', error);
      setEnhanceError(error.message || 'Failed to enhance instructions');
    } finally {
      setIsEnhancing(false);
    }
  };
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Article Instructions</h2>
      
      <div>
        <label 
          htmlFor="instruction" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          How would you like your article to be written?
        </label>
        <div className="relative">
          <textarea
            id="instruction"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., Write a LinkedIn article in a sarcastic tone, in first person, highlighting the key insights from these videos..."
            rows={4}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isEnhancing}
          />
          
          <div className="mt-2 flex items-center justify-between">
            <div>
              {instruction && instruction.length < 10 && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  Please provide a more detailed instruction (at least 10 characters)
                </p>
              )}
              {enhanceError && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {enhanceError}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleEnhanceInstructions}
              disabled={isEnhancing || !instruction || instruction.length < 10}
              className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isEnhancing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enhancing...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Enhance Instructions
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <button
          onClick={() => setIsExamplesOpen(!isExamplesOpen)}
          className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Example Instructions</h3>
          {isExamplesOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        
        {isExamplesOpen && (
          <div className="p-3 bg-white dark:bg-gray-800 text-sm">
            <p className="text-gray-600 dark:text-gray-400 mb-3 italic">
              These are just examples to help you get started. Feel free to modify them or create your own instructions.
            </p>
            
            <div className="space-y-4">
              {/* How-To Guide Example */}
              <div className="border-l-4 border-blue-500 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">How-To Guide / Tutorial</h4>
                  <button
                    onClick={() => setInstruction("Create a comprehensive step-by-step tutorial from these videos, including all necessary details for beginners to follow along. Include code snippets where relevant, screenshots descriptions, and troubleshooting tips for common issues. Format with clear headings, bullet points for key takeaways, and a summary at the end.")} 
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    Use
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Instructional post teaching readers how to accomplish a specific task</p>
              </div>
              
              {/* Listicle Example */}
              <div className="border-l-4 border-green-500 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Listicle</h4>
                  <button
                    onClick={() => setInstruction("Create a '10 Essential Tips' article based on these videos. Each point should have a descriptive heading, 2-3 paragraphs of explanation, and practical examples. Include an introduction explaining why these tips matter and a conclusion summarizing the key takeaways. Use a friendly, authoritative tone.")} 
                    className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    Use
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Article structured as a list, such as "Top 10..." posts</p>
              </div>
              
              {/* Opinion Piece Example */}
              <div className="border-l-4 border-purple-500 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Opinion Piece</h4>
                  <button
                    onClick={() => setInstruction("Write an opinion article in first person that takes a clear stance on the topics discussed in these videos. Include personal insights, counterarguments to common objections, and evidence to support my position. The tone should be thoughtful but passionate, and the structure should build a compelling case for my perspective.")} 
                    className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                  >
                    Use
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Post sharing personal viewpoints on a subject</p>
              </div>
              
              {/* Narrative/Storytelling Example */}
              <div className="border-l-4 border-yellow-500 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Narrative/Storytelling</h4>
                  <button
                    onClick={() => setInstruction("Transform the content from these videos into a narrative story that illustrates the key concepts through a protagonist's journey. Use descriptive language, dialogue where appropriate, and a clear story arc with a beginning, middle, and resolution. The story should both entertain and educate, making complex ideas accessible through storytelling.")} 
                    className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                  >
                    Use
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Article conveying information through a story or personal anecdote</p>
              </div>
              
              {/* Review/Analysis Example */}
              <div className="border-l-4 border-red-500 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Review/Analysis</h4>
                  <button
                    onClick={() => setInstruction("Create a detailed analysis of the concepts/products/ideas presented in these videos. Include a clear evaluation framework, pros and cons, comparisons to alternatives, and a final verdict with ratings. The tone should be objective and evidence-based, while still providing clear recommendations for the reader.")} 
                    className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    Use
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Critical evaluation of products, services, or experiences</p>
              </div>
              
              {/* News/Update Example */}
              <div className="border-l-4 border-indigo-500 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">News or Update Article</h4>
                  <button
                    onClick={() => setInstruction("Write a news-style article reporting on the developments/announcements covered in these videos. Use an inverted pyramid structure with the most important information first, followed by supporting details. Include relevant quotes from the videos, contextual background information, and implications for the future. The tone should be informative and objective.")} 
                    className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                  >
                    Use
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Post informing readers about recent events or developments</p>
              </div>
              
              {/* Personal Journal Example */}
              <div className="border-l-4 border-pink-500 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Personal Journal/Reflection</h4>
                  <button
                    onClick={() => setInstruction("Write a reflective journal entry in first person that connects the content from these videos to personal experiences. Include honest thoughts, feelings, and insights about how this information has changed my perspective. The tone should be authentic and introspective, with a balance of vulnerability and thoughtfulness.")} 
                    className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
                  >
                    Use
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Entry sharing personal experiences or thoughts</p>
              </div>
              
              {/* Technical Deep Dive Example */}
              <div className="border-l-4 border-cyan-500 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Technical Deep Dive</h4>
                  <button
                    onClick={() => setInstruction("Create an in-depth technical article exploring the concepts from these videos. Include detailed explanations of underlying principles, code examples or technical diagrams where relevant, and analysis of edge cases or limitations. The article should be comprehensive enough for experts while still being accessible to intermediate practitioners. Use proper technical terminology and cite relevant research or documentation.")} 
                    className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors"
                  >
                    Use
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">In-depth exploration of technical topics</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructionInput;
