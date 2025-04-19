import { app, BrowserWindow, shell, ipcMain, Menu, dialog } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import isDev from 'electron-is-dev';
import electronUpdater from 'electron-updater';
import Store from 'electron-store';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
const { autoUpdater } = electronUpdater;

// Initialize the secure store for API keys
const store = new Store({
  name: 'yt2blog-keys',
  encryptionKey: 'your-secure-encryption-key', // In production, use a more secure key generation method
  schema: {
    yt2blog_youtube_api_key: {
      type: 'string',
      default: ''
    },
    yt2blog_llm_api_key: {
      type: 'string',
      default: ''
    }
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// Create application menu
function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  
  const template = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Article',
          accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-new-article');
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'About YouTube to Blog',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-show-about');
            }
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const isDev = process.env.IS_DEV === 'true';
  const isMac = process.platform === 'darwin';
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: isDev 
        ? path.join(__dirname, 'preload.js') 
        : path.join(__dirname, 'preload.cjs')
    },
    backgroundColor: '#111827', // Dark background color to match dark theme
    titleBarStyle: 'default', // Use standard title bar to avoid overlap issues
    frame: true, // Ensure window has proper frame
  });

  // Determine the correct URL to load
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`; // Correct path for production
  
  console.log('Loading URL:', startUrl);
  console.log('Current directory:', __dirname);
  
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
  });
  
  // Log any load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Log when content finishes loading and always open DevTools in production for debugging
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Content loaded successfully');
    // Always open DevTools for debugging
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Enable context menu for DevTools access in development mode
  if (isDev) {
    mainWindow.webContents.on('context-menu', (_, params) => {
      const menu = Menu.buildFromTemplate([
        { label: 'Inspect Element', click: () => mainWindow.webContents.inspectElement(params.x, params.y) },
        { type: 'separator' },
        { label: 'Reload', role: 'reload' },
        { label: 'Force Reload', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Toggle Developer Tools', role: 'toggleDevTools' }
      ]);
      menu.popup();
    });
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Show dev tools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Check for updates
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle update events
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

// IPC handlers for API key storage
ipcMain.handle('get-api-key', async (event, key) => {
  return store.get(key, '');
});

ipcMain.handle('set-api-key', async (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('delete-api-key', async (event, key) => {
  store.delete(key);
  return true;
});

// App version handler
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// File save handler
ipcMain.handle('save-file', async (event, content, fileName) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: fileName,
      filters: [{ name: 'Markdown', extensions: ['md'] }, { name: 'All Files', extensions: ['*'] }]
    });
    
    if (!canceled && filePath) {
      await fsPromises.writeFile(filePath, content);
      return { success: true, path: filePath };
    } else {
      return { success: false, error: 'Save cancelled' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});
