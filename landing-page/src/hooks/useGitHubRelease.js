import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch the latest GitHub release information
 * @param {string} owner - The repository owner
 * @param {string} repo - The repository name
 * @returns {Object} The release information including version, date, and loading state
 */
export function useGitHubRelease(owner = 'lagna360', repo = 'yt2blog') {
  const [releaseInfo, setReleaseInfo] = useState({
    version: '1.0.1', // Fallback version if API fails
    date: 'April 20, 2025', // Fallback date if API fails
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    async function fetchReleaseInfo() {
      try {
        // Use the releases API with a 10-second timeout
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
          { 
            signal: controller.signal,
            headers: { 'Accept': 'application/vnd.github.v3+json' },
            cache: 'no-cache'
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch release info: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Make sure component is still mounted before updating state
        if (!isMounted) return;
        
        // Extract version (remove 'v' prefix if present)
        const version = data.tag_name?.startsWith('v') 
          ? data.tag_name.substring(1) 
          : data.tag_name || '1.0.1';
        
        // Format date (YYYY-MM-DD)
        let formattedDate = 'April 20, 2025'; // Fallback date
        
        if (data.published_at) {
          const releaseDate = new Date(data.published_at);
          formattedDate = releaseDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        
        setReleaseInfo({
          version,
          date: formattedDate,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching GitHub release:', error);
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Use hardcoded fallback values instead of blank values
          setReleaseInfo({
            version: '1.0.1', // Set a fallback version
            date: 'April 20, 2025', // Set a fallback date
            loading: false,
            error: error.message
          });
        }
      }
    }
    
    // Set a small timeout to ensure component is fully mounted
    const timeoutId = setTimeout(fetchReleaseInfo, 100);
    
    // Clean up function
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [owner, repo]);
  
  return releaseInfo;
}
