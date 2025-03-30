/**
 * Service for handling YouTube API interactions
 */

/**
 * Validate a YouTube API key with a lightweight call
 * @param {string} apiKey - YouTube API key to validate
 * @returns {Promise<boolean>} - Whether the API key is valid
 */
export const validateApiKey = async (apiKey) => {
  if (!apiKey) return false;
  
  try {
    // Make a lightweight call to the YouTube API
    // Using the channels endpoint with a minimal part request
    // This is one of the lightest possible calls to verify an API key
    const url = `https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&maxResults=1&key=${apiKey}`;
    
    const response = await fetch(url);
    
    // If the key is invalid, we'll get a 400 or 403 error
    if (response.status === 400 || response.status === 403) {
      return false;
    }
    
    // For this specific endpoint, we might get a 401 if not authenticated
    // but that doesn't necessarily mean the key is invalid
    // Let's try another lightweight call that doesn't require authentication
    if (response.status === 401) {
      const publicUrl = `https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&maxResults=1&key=${apiKey}`;
      const publicResponse = await fetch(publicUrl);
      return publicResponse.ok;
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error validating YouTube API key:', error);
    return false;
  }
};

/**
 * Extract video ID from a YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid URL
 */
export const extractVideoId = (url) => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Validate YouTube URL
 * @param {string} url - YouTube URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export const isValidYoutubeUrl = (url) => {
  return extractVideoId(url) !== null;
};

/**
 * Fetch video details from YouTube API
 * @param {string} apiKey - YouTube API key
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Video details
 */
export const fetchVideoDetails = async (apiKey, videoId) => {
  if (!apiKey || !videoId) {
    throw new Error('API key and video ID are required');
  }
  
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch video details');
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }
    
    return data.items[0];
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
};

/**
 * Fetch video transcript/captions from YouTube API
 * @param {string} apiKey - YouTube API key
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} - Video transcript
 */
export const fetchVideoTranscript = async (apiKey, videoId) => {
  if (!apiKey || !videoId) {
    throw new Error('API key and video ID are required');
  }
  
  // First, get the caption tracks available for the video
  const captionListUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;
  
  try {
    const response = await fetch(captionListUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch captions');
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('No captions available for this video');
    }
    
    // Prefer English captions if available
    const captionTrack = data.items.find(item => 
      item.snippet.language === 'en' || item.snippet.language === 'en-US'
    ) || data.items[0];
    
    // Get the caption track ID
    const captionId = captionTrack.id;
    
    // Fetch the actual transcript
    // Note: This is a simplified approach. In reality, YouTube API doesn't provide direct access to captions
    // You would need to use a third-party service or library to get the actual transcript
    
    // For demonstration purposes, we'll simulate getting a transcript
    // In a real implementation, you would use a proper YouTube transcript API or service
    return `Transcript for video ${videoId} (This is a placeholder - actual implementation would require a YouTube transcript API or service)`;
  } catch (error) {
    console.error('Error fetching video transcript:', error);
    throw error;
  }
};

/**
 * Scrape content from a YouTube video
 * @param {string} apiKey - YouTube API key
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} - Scraped content (title, description, transcript)
 */
export const scrapeYoutubeContent = async (apiKey, url) => {
  const videoId = extractVideoId(url);
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  try {
    // Fetch video details
    const videoDetails = await fetchVideoDetails(apiKey, videoId);
    
    // Extract relevant information
    const title = videoDetails.snippet.title;
    const description = videoDetails.snippet.description;
    
    // Fetch transcript
    let transcript;
    try {
      transcript = await fetchVideoTranscript(apiKey, videoId);
    } catch (transcriptError) {
      console.warn('Could not fetch transcript:', transcriptError.message);
      transcript = 'Transcript unavailable';
    }
    
    return {
      videoId,
      url,
      title,
      description,
      transcript,
      channelTitle: videoDetails.snippet.channelTitle,
      publishedAt: videoDetails.snippet.publishedAt
    };
  } catch (error) {
    console.error('Error scraping YouTube content:', error);
    throw error;
  }
};
