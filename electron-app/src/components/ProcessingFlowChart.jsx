import { useAppContext } from '../context/AppContext';

const ProcessingFlowChart = () => {
  const { 
    currentStep, 
    isProcessing, 
    generationProgress = {}, 
  } = useAppContext();
  
  // Only show if we're past the input step
  if (currentStep === 'input') {
    return null;
  }
  
  // Define the stages of processing with their status
  const getStageStatus = (stage) => {
    if (!generationProgress[stage]) return 'pending';
    if (generationProgress[stage] === 'in-progress') return 'in-progress';
    if (generationProgress[stage] === 'complete') return 'complete';
    return 'pending';
  };

  // Helper function to render a status icon based on stage status
  const renderStatusIcon = (status) => {
    if (status === 'in-progress') {
      return (
        <svg className="animate-spin h-5 w-5 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    } else if (status === 'complete') {
      return (
        <svg className="h-5 w-5 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      );
    }
  };

  // Render a process box
  const ProcessBox = ({ title, status, description }) => {
    const bgColor = status === 'in-progress' 
      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
      : status === 'complete'
        ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
    
    const textColor = status === 'in-progress'
      ? 'text-blue-700 dark:text-blue-300'
      : status === 'complete'
        ? 'text-green-700 dark:text-green-300'
        : 'text-gray-500 dark:text-gray-400';
    
    return (
      <div className={`p-3 rounded-lg border ${bgColor} transition-all duration-300 flex items-center`}>
        <div className="mr-3">
          {renderStatusIcon(status)}
        </div>
        <div>
          <h4 className={`font-medium ${textColor}`}>{title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    );
  };

  // Render a connector arrow
  const ConnectorArrow = ({ active }) => (
    <div className="flex justify-center my-2">
      <svg 
        className={`h-6 w-6 ${active ? 'text-blue-500 dark:text-blue-400' : 'text-gray-300 dark:text-gray-700'} transition-colors duration-300`} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  );

  // Define the generation styles with their verification steps
  const generationStyles = [
    { 
      id: 'academic', 
      title: 'Academic Style', 
      description: 'Formal, research-based approach',
      verificationId: 'academic-verification',
      verificationTitle: 'Academic Critique',
      verificationDescription: 'Analyzing academic quality and rigor'
    },
    { 
      id: 'creative', 
      title: 'Creative Style', 
      description: 'Engaging, narrative-driven content',
      verificationId: 'creative-verification',
      verificationTitle: 'Creative Critique',
      verificationDescription: 'Evaluating narrative engagement and flow'
    },
    { 
      id: 'technical', 
      title: 'Technical Style', 
      description: 'Clear, concise technical writing',
      verificationId: 'technical-verification',
      verificationTitle: 'Technical Critique',
      verificationDescription: 'Assessing clarity and technical accuracy'
    }
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Processing Flow</h2>
      
      {/* Generation Phase */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Phase 1: Parallel Content Generation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {generationStyles.map(style => (
            <div key={style.id} className="flex flex-col space-y-2">
              <ProcessBox 
                title={style.title}
                status={getStageStatus(`generation-${style.id}`)}
                description={style.description}
              />
              {/* Verification step for this style */}
              <ProcessBox 
                title={style.verificationTitle}
                status={getStageStatus(style.verificationId)}
                description={style.verificationDescription}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Connector */}
      <ConnectorArrow active={generationProgress['verification-complete']} />
      
      {/* Final Generation Phase */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Phase 2: Final Article Creation</h3>
        <div className="max-w-md mx-auto">
          <ProcessBox 
            title="Refined Article"
            status={getStageStatus('final-generation')}
            description="Creating optimized final article from all inputs"
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessingFlowChart;
