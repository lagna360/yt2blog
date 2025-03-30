/**
 * Utility functions for validation
 */

import { isValidYoutubeUrl } from '../services/youtubeService';

/**
 * Validate YouTube API key format
 * @param {string} apiKey - YouTube API key to validate
 * @returns {boolean} - Whether the API key format is valid
 */
export const isValidYoutubeApiKeyFormat = (apiKey) => {
  if (!apiKey) return false;
  
  // YouTube API keys are typically 39 characters
  // This is a simple format check, not a verification of the key's validity
  const apiKeyRegex = /^[A-Za-z0-9_-]{39}$/;
  return apiKeyRegex.test(apiKey);
};

/**
 * Validate LLM API key format
 * @param {string} apiKey - LLM API key to validate
 * @returns {boolean} - Whether the API key format is valid
 */
export const isValidLlmApiKeyFormat = (apiKey) => {
  // We'll only check if the key is not empty
  // Actual validation will be done with a live API call
  return !!apiKey;
};

/**
 * Validate form inputs for the YouTube to Blog process
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result {isValid, errors}
 */
export const validateFormInputs = (formData) => {
  const { youtubeApiKey, llmApiKey, youtubeUrls, instruction } = formData;
  const errors = {};
  
  // Validate YouTube API key
  if (!youtubeApiKey) {
    errors.youtubeApiKey = 'YouTube API key is required';
  } else if (!isValidYoutubeApiKeyFormat(youtubeApiKey)) {
    errors.youtubeApiKey = 'Invalid YouTube API key format';
  }
  
  // Validate LLM API key
  if (!llmApiKey) {
    errors.llmApiKey = 'LLM API key is required';
  } else if (!isValidLlmApiKeyFormat(llmApiKey)) {
    errors.llmApiKey = 'Invalid LLM API key format';
  }
  
  // Validate YouTube URLs
  if (!youtubeUrls || youtubeUrls.length === 0 || !youtubeUrls[0]) {
    errors.youtubeUrls = 'At least one YouTube URL is required';
  } else {
    const urlErrors = [];
    youtubeUrls.forEach((url, index) => {
      if (!url) {
        urlErrors[index] = 'URL cannot be empty';
      } else if (!isValidYoutubeUrl(url)) {
        urlErrors[index] = 'Invalid YouTube URL';
      }
    });
    
    if (urlErrors.length > 0) {
      errors.youtubeUrls = urlErrors;
    }
  }
  
  // Validate instruction
  if (!instruction) {
    errors.instruction = 'Instruction is required';
  } else if (instruction.length < 10) {
    errors.instruction = 'Instruction is too short (minimum 10 characters)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
