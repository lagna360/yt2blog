import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch the latest GitHub release information
 * @param {string} owner - The repository owner
 * @param {string} repo - The repository name
 * @returns {Object} The release information including version, date, and loading state
 */
export function useGitHubRelease(owner = 'lagna360', repo = 'yt2blog') {
  const [releaseInfo, setReleaseInfo] = useState({
    version: '',
    date: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchReleaseInfo() {
      try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch release info: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract version (remove 'v' prefix if present)
        const version = data.tag_name.startsWith('v') 
          ? data.tag_name.substring(1) 
          : data.tag_name;
        
        // Format date (YYYY-MM-DD)
        const releaseDate = new Date(data.published_at);
        const formattedDate = releaseDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        setReleaseInfo({
          version,
          date: formattedDate,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching GitHub release:', error);
        setReleaseInfo({
          version: '',
          date: '',
          loading: false,
          error: error.message
        });
      }
    }
    
    fetchReleaseInfo();
  }, [owner, repo]);
  
  return releaseInfo;
}
