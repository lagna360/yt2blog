/**
 * Utility functions for error handling
 */

/**
 * Format error messages for display
 * @param {Error|string} error - Error object or message
 * @returns {string} - Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  // Handle API errors
  if (error.response) {
    const status = error.response.status;
    
    // YouTube API specific errors
    if (error.message?.includes('YouTube') || error.message?.includes('google')) {
      if (status === 400) return 'Invalid request to YouTube API';
      if (status === 403) return 'YouTube API key is invalid or quota exceeded';
      if (status === 404) return 'Video not found';
    }
    
    // LLM API specific errors
    if (error.message?.includes('LLM') || error.message?.includes('OpenAI')) {
      if (status === 401) return 'Invalid LLM API key';
      if (status === 429) return 'LLM API rate limit exceeded';
    }
    
    // Generic status code errors
    if (status === 401 || status === 403) return 'Authentication failed. Please check your API key';
    if (status === 404) return 'Resource not found';
    if (status === 429) return 'Too many requests. Please try again later';
    if (status >= 500) return 'Server error. Please try again later';
    
    return `Error: ${error.response.data?.message || 'Request failed'}`;
  }
  
  // Network errors
  if (error.message?.includes('Network') || error.message?.includes('ECONNREFUSED')) {
    return 'Network error. Please check your internet connection';
  }
  
  // Default to error message or generic error
  return error.message || 'An unexpected error occurred';
};

/**
 * Create a user-friendly error object
 * @param {Error|string} error - Original error
 * @param {string} context - Context where the error occurred
 * @returns {Object} - User-friendly error object
 */
export const createErrorObject = (error, context) => {
  return {
    message: formatErrorMessage(error),
    context,
    timestamp: new Date().toISOString(),
    original: error
  };
};
