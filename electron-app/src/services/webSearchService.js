/**
 * Service for handling web search API interactions
 */

import { calculateTokenCost } from './tokenPricingService';

/**
 * Perform a web search on a topic using OpenAI
 * @param {string} apiKey - OpenAI API key
 * @param {string} topic - Topic to search
 * @param {Function} onTokenUsage - Callback to record token usage
 * @returns {Object} - Search results
 */
export const performWebSearch = async (apiKey, topic, onTokenUsage) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  if (!topic || topic.trim().length === 0) {
    throw new Error('Topic is required');
  }
  
  console.log('Performing web search for:', topic);
  
  try {
    const baseUrl = 'https://api.openai.com/v1/chat/completions';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant that provides accurate, up-to-date information. Format your responses as bullet points with key facts.'
          },
          {
            role: 'user',
            content: `Research the latest information about: ${topic}. Focus on facts, statistics, and recent developments. Format the results as a concise bullet-point list of the most important facts that would be useful for writing an article. Include 3-5 key sources at the end.`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to perform web search');
    }
    
    const data = await response.json();
    
    // Track token usage and calculate cost
    if (data.usage && onTokenUsage) {
      // Extract token usage from the response
      // If only total_tokens is available (new API format), estimate input/output split
      let input_tokens = data.usage.input_tokens || 0;
      let output_tokens = data.usage.output_tokens || 0;
      const total_tokens = data.usage.total_tokens || 0;
      
      // If we have total but not input/output tokens, estimate a 30/70 split (typical for chat)
      if (total_tokens > 0 && input_tokens === 0 && output_tokens === 0) {
        input_tokens = Math.round(total_tokens * 0.3);
        output_tokens = total_tokens - input_tokens;
      }
      
      console.log('WEB SEARCH TOKEN USAGE:', { input_tokens, output_tokens, total_tokens });
      
      const model = data.model || 'gpt-4o';
      
      // Create token cost object with clear operation name
      const tokenCost = calculateTokenCost(
        model, 
        input_tokens, 
        output_tokens, 
        `Web Search: ${topic.substring(0, 20)}...`
      );
      
      // Log for debugging
      console.log('Web search token usage:', {
        model,
        input_tokens,
        output_tokens,
        total: input_tokens + output_tokens
      });
      
      onTokenUsage(tokenCost);
    }
    
    // Extract the model's response
    const searchSummary = data.choices[0].message.content;
    
    // Parse the sources from the summary text - they should be at the end after "Sources:" or similar
    const searchResults = [];
    const sourceRegex = /sources?:?\s*([\s\S]*)/i;
    const sourceMatch = searchSummary.match(sourceRegex);
    
    if (sourceMatch && sourceMatch[1]) {
      const sourceText = sourceMatch[1].trim();
      const sources = sourceText.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          // Try to extract URLs from the line
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const urlMatch = line.match(urlRegex);
          const url = urlMatch ? urlMatch[0] : '';
          const title = line.replace(url, '').trim().replace(/^[\d\.\-\*]\s*/, '');
          
          return {
            title: title || 'Source', 
            url: url || '#'
          };
        });
      
      if (sources.length > 0) {
        searchResults.push(...sources);
      }
    }
    
    return {
      summary: searchSummary,
      sources: searchResults.map(result => ({
        title: result.title,
        url: result.url
      }))
    };
  } catch (error) {
    console.error('Error performing web search:', error);
    throw error;
  }
};
