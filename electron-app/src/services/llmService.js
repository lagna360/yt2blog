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

/**
 * Generate an article using the LLM API with parallel generation and refinement
 * @param {string} apiKey - LLM API key
 * @param {Object} content - Scraped content from YouTube videos
 * @param {string} instruction - User's instruction for article generation
 * @param {Function} updateProgress - Function to update generation progress
 * @param {boolean} keepBranding - Whether to keep original branding in the article
 * @param {string} feedback - Optional feedback from verification for improvement
 * @returns {Promise<string>} - Generated article
 */
export const generateArticle = async (apiKey, content, instruction, updateProgress, keepBranding = false, feedback = null) => {
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
  
  // Base prompt for all generators
  const basePrompt = `
You are tasked with writing an article based on the following YouTube video content:

${videoSummaries}

The article should follow these instructions:
${instruction}

IMPORTANT: Remove all branding and references to original source content. Do not mention YouTube, channel names, or any other identifying information from the original videos.
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
      
      const article = await generateSingleArticle(
        apiKey, 
        basePrompt, 
        config.systemPrompt, 
        config.temperature
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
        config.label
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
      keepBranding
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
 * @returns {Promise<string>} - Generated article
 */
async function generateSingleArticle(apiKey, prompt, systemPrompt, temperature) {
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
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperature
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your key and try again.');
    }
    throw new Error(errorData.error?.message || 'Failed to generate article');
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Criticize a generated article
 * @param {string} apiKey - LLM API key
 * @param {string} article - The article to criticize
 * @param {string} instruction - Original instruction
 * @param {string} styleLabel - Label for the article style
 * @returns {Promise<string>} - Criticism of the article
 */
async function criticizeArticle(apiKey, article, instruction, styleLabel) {
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
  return data.choices[0].message.content;
}

/**
 * Create a refined article based on multiple articles and their criticisms
 * @param {string} apiKey - LLM API key
 * @param {Array} articlesWithCriticism - Array of articles with their criticisms
 * @param {string} instruction - Original instruction
 * @param {string} videoSummaries - Original video content summaries
 * @returns {Promise<string>} - Final refined article
 */
async function createRefinedArticle(apiKey, articlesWithCriticism, instruction, videoSummaries, keepBranding = false) {
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
${!keepBranding ? '6. CRITICAL: Remove all branding and references to original source content. Do not mention YouTube, channel names, or any other identifying information from the original videos.' : '6. You may retain references to original sources, channel names, and other identifying information from the original videos if they add value to the content.'}

Before submitting your final article, count the words and verify it meets any word count requirements specified in the instructions.

Write the final article now.
`;
  
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
    throw new Error(errorData.error?.message || 'Failed to generate refined article');
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
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
You are an expert content strategist helping a user create better instructions for an AI article generator.

The user is using a tool that converts YouTube videos into blog articles. The user provides:
1. YouTube video URLs (which are processed to extract transcripts and content)
2. Instructions for how they want the article to be written

IMPORTANT: After the article is generated, it will be evaluated by an AI verifier that checks the quality and adherence to instructions. The verifier analyzes the article based on these criteria:
- Adherence to instructions (how well it follows the given instructions)
- Content quality (depth, accuracy, and relevance)
- Structure and organization (logical flow, clarity)
- Writing style and engagement (readability, tone)
- Overall impact and value to the reader

The user has provided the following instructions:
"${originalInstruction}"

Your task is to enhance these instructions to create a more detailed, specific, and effective prompt that will result in a better article AND make it easier for the verification system to evaluate. Consider:

- Adding specific details about tone, style, and voice (be explicit about what tone means)
- Clarifying the target audience (be specific about who will read this)
- Suggesting structure elements (specific headings, sections, etc.)
- Specifying content priorities (what to emphasize or de-emphasize)
- Including measurable quality criteria that the verifier can check
- Making requirements explicit and unambiguous
- Adding any other elements that would improve the quality of the generated article

Provide an enhanced version of the instructions that maintains the user's original intent but adds helpful specificity and guidance that will make both generation and verification more effective.
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
            content: 'You are an expert content strategist who helps users create better instructions for AI content generation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
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
