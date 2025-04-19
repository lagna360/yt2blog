// Use dynamic import for Electron to work in both ESM and CommonJS environments
let electron;

// This special pattern allows the preload script to work in both ESM and CommonJS environments
// which is important for Electron's preload scripts in production builds
const initBridge = async () => {
  try {
    // Try to load Electron as an ES module
    const electronModule = await import('electron');
    electron = electronModule;
  } catch (err) {
    // Fallback to CommonJS require if ES module import fails
    // This is needed for the packaged app where preload scripts may be treated differently
    try {
      electron = require('electron');
    } catch (requireErr) {
      console.error('Failed to load electron:', requireErr);
      return;
    }
  }

  const { contextBridge, ipcRenderer } = electron;

  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  contextBridge.exposeInMainWorld(
    'electron',
    {
      // App info
      getAppVersion: () => ipcRenderer.invoke('get-app-version'),
      
      // Updates
      onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
      onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
      
      // File system operations
      saveFile: (content, fileName) => ipcRenderer.invoke('save-file', content, fileName),
      
      // Platform info
      getPlatform: () => process.platform,
      
      // API key storage
      getApiKey: (key) => ipcRenderer.invoke('get-api-key', key),
      setApiKey: (key, value) => ipcRenderer.invoke('set-api-key', key, value),
      deleteApiKey: (key) => ipcRenderer.invoke('delete-api-key', key),
      
      // Menu event handlers
      onMenuNewArticle: (callback) => ipcRenderer.on('menu-new-article', callback),
      onMenuShowAbout: (callback) => ipcRenderer.on('menu-show-about', callback),
      
      // App info
      getAppVersion: () => ipcRenderer.invoke('get-app-version')
    }
  );
};

// Initialize the bridge
initBridge().catch(err => {
  console.error('Failed to initialize preload bridge:', err);
});
