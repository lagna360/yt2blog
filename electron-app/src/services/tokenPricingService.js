/**
 * Service for tracking token usage and calculating API costs
 */

// Define pricing per million tokens for different models
const PRICING = {
  'gpt-4.1': {
    input: 2.00,
    output: 0.50
  },
  'gpt-4.1-2025-04-14': {
    input: 2.00,
    output: 0.50
  },
  'gpt-4o': {
    input: 2.50,
    output: 1.25
  },
  'gpt-4o-2024-08-06': {
    input: 2.50,
    output: 1.25
  },
  'gpt-4o-mini-search-preview': {
    input: 0.15,
    output: 0.60
  },
  'gpt-4o-mini-search-preview-2025-03-11': {
    input: 0.15,
    output: 0.60
  }
};

// Default to gpt-4o if model not found
const DEFAULT_MODEL = 'gpt-4o';

/**
 * Calculate cost for token usage
 * @param {string} model - The model used for the API call
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @param {string} operation - The type of operation (e.g., 'generation', 'critique')
 * @returns {Object} - Calculated costs and token usage
 */
export const calculateTokenCost = (model, inputTokens, outputTokens, operation = 'api-call') => {
  // Ensure we have a valid model - default to gpt-4o if not found or undefined
  const actualModel = model && PRICING[model] ? model : DEFAULT_MODEL;
  
  // Get pricing for the model
  const pricing = PRICING[actualModel];
  
  // Ensure we have valid token values, defaulting to 0 if undefined
  const safeInputTokens = Number(inputTokens) || 0;
  const safeOutputTokens = Number(outputTokens) || 0;
  
  // Calculate costs per category (with extra precision)
  const inputCost = (safeInputTokens / 1000000) * pricing.input;
  const outputCost = (safeOutputTokens / 1000000) * pricing.output;
  const totalCost = inputCost + outputCost;
  
  // Log the cost calculations for debugging
  console.log('COST CALCULATION:', {
    model: actualModel,
    inputTokens: safeInputTokens,
    outputTokens: safeOutputTokens,
    inputPricePerMillion: pricing.input,
    outputPricePerMillion: pricing.output,
    inputCost,
    outputCost,
    totalCost
  });
  
  // Generate a timestamp
  const timestamp = new Date().toISOString();
  
  return {
    model: actualModel,
    operation,
    timestamp,
    inputTokens: safeInputTokens,
    outputTokens: safeOutputTokens,
    totalTokens: safeInputTokens + safeOutputTokens,
    inputCost,
    outputCost,
    totalCost
  };
};

/**
 * Format cost as currency
 * @param {number} cost - Cost in USD
 * @returns {string} - Formatted cost string
 */
export const formatCost = (cost) => {
  // Handle undefined or NaN values
  if (cost === undefined || isNaN(cost)) {
    return '$0.000';
  }
  
  // For very small values, we still want to show something meaningful
  // instead of rounding to $0.000, but we'll keep it at 3 decimal places
  if (cost < 0.001) {
    return cost === 0 ? '$0.000' : '$0.001'; // Minimum display of $0.001 for any non-zero cost
  }
  
  // Standard 3-decimal format for all values as requested
  return `$${cost.toFixed(3)}`;
};

/**
 * Summarize total token usage and costs across multiple API calls
 * @param {Array} tokenUsages - Array of token usage objects
 * @returns {Object} - Summary of token usage and costs
 */
export const summarizeTokenUsage = (tokenUsages) => {
  if (!tokenUsages || tokenUsages.length === 0) {
    return {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      modelCounts: {},
      detailedUsage: []
    };
  }
  
  // Initialize counters
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;
  const modelCounts = {};
  const operationCounts = {};
  const detailedUsage = [];
  
  // Sum up all token usage
  tokenUsages.forEach((usage, index) => {
    // Ensure we have valid numbers
    const inputTokens = Number(usage.inputTokens) || 0;
    const outputTokens = Number(usage.outputTokens) || 0;
    const cost = Number(usage.totalCost) || 0;
    
    totalInputTokens += inputTokens;
    totalOutputTokens += outputTokens;
    totalCost += cost;
    
    // Count model usage
    if (usage.model) {
      const modelName = usage.model.startsWith('gpt-') ? usage.model : 'gpt-4o';
      modelCounts[modelName] = (modelCounts[modelName] || 0) + 1;
    }
    
    // Count operation types
    const operation = usage.operation || 'api-call';
    operationCounts[operation] = (operationCounts[operation] || 0) + 1;
    
    // Add detailed item for display
    detailedUsage.push({
      id: index + 1,
      operation: operation,
      model: usage.model || 'gpt-4o',
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: cost
    });
  });
  
  return {
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    totalCost,
    modelCounts,
    operationCounts,
    detailedUsage
  };
};
