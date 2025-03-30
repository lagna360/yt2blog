import { contextBridge, ipcRenderer } from 'electron';

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
