/**
 * Service for handling LLM API interactions
 */

/**
 * Validate an OpenAI API key with a lightweight call
 * @param {string} apiKey - LLM API key to validate
 * @returns {Promise<boolean>} - Whether the API key is valid
 */
export const validateApiKey = async (apiKey) => {
  if (!apiKey) return false;
  
  try {
    // Make a lightweight call to the OpenAI API with gpt-4o model
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: 'Hello world'
          }
        ],
        max_tokens: 5
      })
    });
    
    if (!response.ok) {
      return false;
    }
    
    await response.json(); // Just to confirm we can parse the response
    return true;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

import { createErrorObject } from '../utils/errorUtils';
import { performWebSearch } from './webSearchService';
import { calculateTokenCost } from './tokenPricingService';

/**
 * Generate an article using the LLM API with parallel generation and refinement
 * @param {string} apiKey - LLM API key
 * @param {Object} content - Scraped content from YouTube videos
 * @param {string} instruction - User's instruction for article generation
 * @param {Function} updateProgress - Function to update generation progress
 * @param {boolean} keepBranding - Whether to keep original branding in the article
 * @param {boolean} searchInternet - Whether to use web search for additional content
 * @param {string} feedback - Optional feedback from verification for improvement
 * @param {Function} onTokenUsage - Callback to record token usage
 * @returns {Promise<string>} - Generated article
 */
export const generateArticle = async (apiKey, content, instruction, updateProgress, keepBranding = false, searchInternet = false, feedback = null, onTokenUsage = null) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  if (!content || Object.keys(content).length === 0) {
    throw new Error('Content is required');
  }
  
  if (!instruction) {
    throw new Error('Instruction is required');
  }
  
  // Reset progress tracking
  if (updateProgress) {
    updateProgress('generation-academic', 'pending');
    updateProgress('generation-creative', 'pending');
    updateProgress('generation-technical', 'pending');
    updateProgress('academic-verification', 'pending');
    updateProgress('creative-verification', 'pending');
    updateProgress('technical-verification', 'pending');
    updateProgress('final-generation', 'pending');
  }
  
  // Prepare the content for the LLM
  const videoSummaries = Object.values(content).map(video => {
    return `
Title: ${video.title}
Channel: ${video.channelTitle}
Description: ${video.description}
Transcript: ${video.transcript}
    `;
  }).join('\n\n');
  
  // If searchInternet is true, perform web search to enhance content
  let webSearchResults = null;
  if (searchInternet) {
    try {
      if (updateProgress) {
        updateProgress('web-search', 'in-progress');
      }
      
      // Extract main topics from video titles for the search
      const titles = Object.values(content).map(video => video.title).join(", ");
      webSearchResults = await performWebSearch(apiKey, titles, (tokenCost) => {
        if (onTokenUsage) onTokenUsage(tokenCost);
      });
      
      if (updateProgress) {
        updateProgress('web-search', 'complete');
      }
      
      console.log('Web search performed successfully:', webSearchResults.summary);
      console.log('Sources:', webSearchResults.sources.length);
    } catch (error) {
      console.error('Error performing web search:', error);
      if (updateProgress) {
        updateProgress('web-search', 'error');
      }
      // Continue without web search if it fails
      webSearchResults = null;
    }
  }
  
  // Base prompt for all generators
  const basePrompt = `
You are tasked with writing an article based on the following YouTube video content:

${videoSummaries}

${webSearchResults ? `ADDITIONAL WEB SEARCH INFORMATION:
The following information was gathered from recent web searches to supplement the video content. Use this information to enhance the article with additional facts, statistics, and recent developments.

${webSearchResults.summary}

SOURCES:
${webSearchResults.sources.map((source, index) => `${index + 1}. ${source.title} - ${source.url}`).join('\n')}
` : ''}

The article should follow these instructions:
${instruction}

IMPORTANT: Remove all branding and references to original source content from the main article content. Do not mention YouTube, channel names, or any other identifying information from the original videos within the article body.

${keepBranding ? `REFERENCES SECTION: After completing the main article content, add a "References" section at the very end that lists all sources used. Format as follows:
1. List each YouTube video with title, channel name, and full URL
2. List each web search source with title and URL
Make sure all URLs are included for proper citation.` : 'Do NOT include any references section at the end.'}

${webSearchResults ? 'When incorporating information from web search results, prioritize the YouTube content as the primary source, but use the web search data to add depth, context, and up-to-date information.' : ''}
${feedback ? `

Previous feedback for improvement:
${feedback}` : ''}
  `;
  
  try {
    // Define three different generator configurations
    const generatorConfigs = [
      {
        systemPrompt: 'You are a professional content creator who writes high-quality, formal articles with academic rigor.',
        temperature: 0.5,
        label: 'Academic Style',
        progressId: 'generation-academic',
        verificationId: 'academic-verification'
      },
      {
        systemPrompt: 'You are a creative storyteller who writes engaging, narrative-driven content that captivates readers.',
        temperature: 0.8,
        label: 'Creative Style',
        progressId: 'generation-creative',
        verificationId: 'creative-verification'
      },
      {
        systemPrompt: 'You are a technical expert who writes clear, concise, and informative content with practical insights.',
        temperature: 0.3,
        label: 'Technical Style',
        progressId: 'generation-technical',
        verificationId: 'technical-verification'
      }
    ];
    
    console.log('Starting parallel article generation with 3 different styles...');
    
    // Generate articles in parallel
    const articlePromises = generatorConfigs.map(async (config) => {
      // Update progress to in-progress
      if (updateProgress) {
        updateProgress(config.progressId, 'in-progress');
      }
      
      // Generate article for this style
      const article = await generateSingleArticle(
        apiKey, 
        basePrompt, 
        config.systemPrompt, 
        config.temperature,
        // Pass style label for better token tracking
        (tokenCost) => {
          if (onTokenUsage) {
            // Override operation name for clearer tracking
            tokenCost.operation = `Generate ${config.label}`;
            onTokenUsage(tokenCost);
          }
        }
      );
      
      // Mark generation as complete
      if (updateProgress) {
        updateProgress(config.progressId, 'complete');
        // Start verification
        updateProgress(config.verificationId, 'in-progress');
      }
      
      // Get criticism for this article
      const criticism = await criticizeArticle(
        apiKey,
        article,
        instruction,
        config.label,
        // Pass operation name for better token tracking
        (tokenCost) => {
          if (onTokenUsage) {
            // Override operation name for clearer tracking
            tokenCost.operation = `Review ${config.label}`;
            onTokenUsage(tokenCost);
          }
        }
      );
      
      // Mark verification as complete
      if (updateProgress) {
        updateProgress(config.verificationId, 'complete');
      }
      
      return {
        article,
        criticism,
        label: config.label
      };
    });
    
    // Wait for all articles and their criticisms
    const articlesWithCriticism = await Promise.all(articlePromises);
    
    console.log('All articles generated and criticized. Creating final refined version...');
    
    // Mark generation phase as complete
    if (updateProgress) {
      updateProgress('generation-complete', 'complete');
      updateProgress('verification-complete', 'complete');
      updateProgress('final-generation', 'in-progress');
    }
    
    // Generate the final refined article
    const finalArticle = await createRefinedArticle(
      apiKey,
      articlesWithCriticism,
      instruction,
      videoSummaries,
      keepBranding,
      // Pass operation name for better token tracking
      (tokenCost) => {
        if (onTokenUsage) {
          // Override operation name for clearer tracking
          tokenCost.operation = 'Final Article Refinement';
          onTokenUsage(tokenCost);
        }
      }
    );
    
    // Mark final generation as complete
    if (updateProgress) {
      updateProgress('final-generation', 'complete');
    }
    
    return finalArticle;
  } catch (error) {
    console.error('Error in article generation process:', error);
    throw error;
  }
};

/**
 * Generate a single article with specific configuration
 * @param {string} apiKey - LLM API key
 * @param {string} prompt - The base prompt
 * @param {string} systemPrompt - System instruction
 * @param {number} temperature - Temperature setting
 * @param {Function} onTokenUsage - Callback to record token usage
 * @returns {Promise<string>} - Generated article
 */
async function generateSingleArticle(apiKey, prompt, systemPrompt, temperature, onTokenUsage = null) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature || 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `API error: ${response.status}`
      );
    }
    
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Failed to generate article');
    }
    
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
      
      console.log('TOKEN USAGE:', { input_tokens, output_tokens, total_tokens });
      
      // Determine the model (fallback to gpt-4o if not specified)
      const model = data.model || 'gpt-4o';
      // Create a generic operation name that will be overridden by the caller
      const operationType = 'Article Generation';
      const tokenCost = calculateTokenCost(model, input_tokens, output_tokens, operationType);
      onTokenUsage(tokenCost);
    }

    const generatedText = data.choices[0].message.content;
    return generatedText;
  } catch (error) {
    console.error('Error generating article:', error);
    throw error;
  }
}

/**
 * Criticize a generated article
 * @param {string} apiKey - LLM API key
 * @param {string} article - The article to criticize
 * @param {string} instruction - Original instruction
 * @param {string} styleLabel - Label for the article style
 * @param {Function} onTokenUsage - Callback to record token usage
 * @returns {Promise<string>} - Criticism of the article
 */
async function criticizeArticle(apiKey, article, instruction, styleLabel, onTokenUsage = null) {
  const baseUrl = 'https://api.openai.com/v1/chat/completions';
  
  // Calculate word count
  const wordCount = article.trim().split(/\s+/).length;
  
  const criticismPrompt = `
You are a critical editor reviewing an article. The article was written in a "${styleLabel}" style.

The article was supposed to follow these instructions:
${instruction}

Here is the article to critique:
${article}

WORD COUNT: ${wordCount} words

Provide a detailed critique of this article. Focus on:
1. How well it follows the instructions (especially any word count requirements)
2. Content quality and accuracy
3. Structure and flow
4. Language and style
5. Areas for improvement

Be specific about whether the word count matches any requirements in the instructions. If there was a specific word count requested and this article doesn't match it, emphasize this as an important issue to fix.

Be specific and constructive in your criticism.
  `;
  
  try {
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
            content: 'You are an expert editor who provides detailed, honest, and constructive criticism.'
          },
          {
            role: 'user',
            content: criticismPrompt
          }
        ],
        temperature: 0.4
      })
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate criticism');
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
      
      console.log('TOKEN USAGE:', { input_tokens, output_tokens, total_tokens });
      
      // Determine the model (fallback to gpt-4o if not specified)
      const model = data.model || 'gpt-4o';
      // Create a generic operation name that will be overridden by the caller
      const operationType = 'Article Generation';
      const tokenCost = calculateTokenCost(model, input_tokens, output_tokens, operationType);
      onTokenUsage(tokenCost);
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error criticizing article:', error);
    throw error;
  }
}

/**
 * Create a refined article based on multiple articles and their criticisms
 * @param {string} apiKey - LLM API key
 * @param {Array} articlesWithCriticism - Array of articles with their criticisms
 * @param {string} instruction - Original instruction
 * @param {string} videoSummaries - Original video content summaries
 * @param {boolean} keepBranding - Whether to keep original branding
 * @param {Function} onTokenUsage - Callback to record token usage
 * @returns {Promise<string>} - Final refined article
 */
async function createRefinedArticle(apiKey, articlesWithCriticism, instruction, videoSummaries, keepBranding = false, onTokenUsage = null) {
  const baseUrl = 'https://api.openai.com/v1/chat/completions';
  
  // Create a prompt that includes all articles and their criticisms
  let refinementPrompt = `
You are an expert editor tasked with creating the best possible article based on the following materials.

The article should be based on this YouTube video content:
${videoSummaries}

The article must follow these instructions:
${instruction}

You have been provided with three different articles and their criticisms:
`;

  // Add each article and its criticism with word counts
  articlesWithCriticism.forEach((item, index) => {
    // Calculate word count for this article
    const wordCount = item.article.trim().split(/\s+/).length;
    
    refinementPrompt += `
\n--- ARTICLE ${index + 1} (${item.label}) ---\n
WORD COUNT: ${wordCount} words

${item.article}

--- CRITICISM OF ARTICLE ${index + 1} ---\n
${item.criticism}
`;
  });
  
  refinementPrompt += `
\nYour task is to create a new article that:
1. Follows the original instructions PERFECTLY, especially any word count requirements
2. Takes the best elements from each of the three articles
3. Addresses the criticisms raised for each article
4. Creates a coherent, high-quality piece that is better than any of the individual articles
5. IMPORTANT: If the instructions specified a word count, make sure your article meets that exact word count requirement
6. CRITICAL: Remove all branding and references to original source content from the main article content. Do not mention YouTube, channel names, or any other identifying information from the original videos within the article body.

${keepBranding ? '7. After completing the main article content, add a "References" section at the very end that lists all sources used. Format as follows:\n   a. List each YouTube video with title, channel name, and full URL\n   b. List each web search source with title and URL\n   Make sure all URLs are included for proper citation.' : '7. Do NOT include any references section at the end of the article.'}

Before submitting your final article, count the words and verify it meets any word count requirements specified in the instructions.

Write the final article now.
`;
  
  try {
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
            content: 'You are a master editor and content creator who can synthesize the best elements of multiple articles while addressing their weaknesses.'
          },
          {
            role: 'user',
            content: refinementPrompt
          }
        ],
        temperature: 0.6
      })
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create refined article');
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
      
      console.log('TOKEN USAGE:', { input_tokens, output_tokens, total_tokens });
      
      // Determine the model (fallback to gpt-4o if not specified)
      const model = data.model || 'gpt-4o';
      // Create a generic operation name that will be overridden by the caller
      const operationType = 'Article Generation';
      const tokenCost = calculateTokenCost(model, input_tokens, output_tokens, operationType);
      onTokenUsage(tokenCost);
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error creating refined article:', error);
    throw error;
  }
};

/**
 * Analyze the quality of a generated article
 * @param {string} apiKey - LLM API key
 * @param {string} article - Generated article to analyze
 * @param {string} instruction - Original instruction
 * @returns {Promise<Object>} - Analysis result with detailed feedback
 */
export const verifyArticle = async (apiKey, article, instruction) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  if (!article) {
    throw new Error('Article is required');
  }
  
  if (!instruction) {
    throw new Error('Instruction is required');
  }
  
  console.log('Analyzing article quality...');
  
  // Calculate word count
  const wordCount = article.trim().split(/\s+/).length;
  
  // Prepare the prompt for analysis
  const prompt = `
You are a quality assurance expert tasked with analyzing an article.

The article was supposed to be written according to these instructions:
${instruction}

Here is the article to analyze:
${article}

WORD COUNT: ${wordCount} words

Please provide a detailed analysis of this article based on the following criteria:
1. Adherence to instructions (how well does it follow the given instructions, especially any word count requirements?)
2. Content quality (depth, accuracy, and relevance)
3. Structure and organization (logical flow, clarity)
4. Writing style and engagement (readability, tone)
5. Overall impact and value to the reader

For each criterion, provide a score from 1-10 and specific observations.
If the instructions specified a word count requirement, explicitly mention whether this article meets that requirement.
Then, provide an overall assessment with strengths and areas for improvement.
  `;
  
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
            content: 'You are a quality assurance expert who provides detailed, objective analysis of content quality.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze article');
    }
    
    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Extract an overall quality score (average of all scores mentioned)
    const scores = analysisText.match(/\b([1-9]|10)\b\s*(\/\s*10)?/g);
    let overallScore = 7; // Default score if parsing fails
    
    if (scores && scores.length > 0) {
      // Extract just the numbers from matches like "8/10" or just "8"
      const numericScores = scores.map(score => {
        const num = parseInt(score.match(/\b([1-9]|10)\b/)[0], 10);
        return num;
      });
      
      // Calculate average score
      overallScore = Math.round(numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length);
    }
    
    return {
      score: overallScore,
      analysis: analysisText,
      // We no longer use the passed/failed concept in our new approach
      passed: overallScore >= 7 // Consider 7+ as passing
    };
    
    /* 
    // Simulation code - commented out since we're using the real API
    console.log('Verifying article with prompt:', prompt);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate verification results
    const iterationSimulation = Math.floor(Math.random() * 3); // 0, 1, or 2
    
    if (iterationSimulation === 0) {
      // First iteration - suggest improvements
      return {
        passed: false,
        feedback: 'The article could be improved by adding more specific examples from the source videos and ensuring better alignment with the requested tone.'
      };
    } else if (iterationSimulation === 1) {
      // Second iteration - minor improvements
      return {
        passed: false,
        feedback: 'The article is much better but could use a stronger conclusion that ties back to the main points.'
      };
    } else {
      // Final iteration - passed
      return {
        passed: true,
        feedback: 'The article meets all quality criteria and follows the instructions well.'
      };
    }
    */
  } catch (error) {
    console.error('Error verifying article:', error);
    throw error;
  }
};

/**
 * Enhance user instructions using LLM
 * @param {string} apiKey - LLM API key
 * @param {string} originalInstruction - User's original instruction
 * @returns {Promise<string>} - Enhanced instruction
 */
export const enhanceInstructions = async (apiKey, originalInstruction) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  if (!originalInstruction || originalInstruction.trim().length < 3) {
    throw new Error('Original instruction is required');
  }
  
  console.log('Enhancing user instructions...');
  
  const prompt = `
You are an expert content strategist helping a user enhance their instructions for an AI article generator. 

The user has provided the following instructions for an article based on YouTube video content:
"${originalInstruction}"

Your task is to rewrite and enhance these instructions with more detail and clarity. The result should be a single, cohesive set of instructions that:

1. Maintains the user's original intent
2. Adds specific details about tone, style, and target audience
3. Suggests specific structure elements (headings, sections)
4. Specifies content priorities and quality criteria

IMPORTANT FORMATTING REQUIREMENTS:
- Return ONLY the enhanced instructions without any explanations, meta-commentary, or notes about what you changed
- Do not include text like "Enhanced Instructions:" or any other labels or headers
- Do not use markdown formatting like "---" dividers
- Do not explain your process or reasoning

Simply provide the enhanced instructions as plain text that could be directly used as input for the article generator.
`;
  
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
            content: 'You are an expert content strategist. When enhancing instructions, you provide only the enhanced instructions without any explanations, meta-commentary, or formatting beyond what is needed for the article itself.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to enhance instructions');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error enhancing instructions:', error);
    throw error;
  }
};
