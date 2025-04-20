import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { exec } from 'child_process'
import { promisify } from 'util'
import { resolve } from 'path'

const execPromise = promisify(exec)

// Function to kill Electron and Vite processes properly
async function killRunningProcesses() {
  try {
    // Kill any Electron processes
    try {
      await execPromise('pkill -f "Electron" || true')
      console.log('Killed existing Electron processes')
    } catch (electronError) {
      console.log('No Electron processes found or error killing them:', electronError.message)
    }
    
    // Kill any process running on the Vite port (5173)
    try {
      const { stdout } = await execPromise('lsof -i :5173 -t')
      if (stdout.trim()) {
        const pids = stdout.trim().split('\n')
        for (const pid of pids) {
          console.log(`Killing process ${pid} on port 5173`)
          await execPromise(`kill -9 ${pid} || true`)
        }
      }
    } catch (portError) {
      // If no process is found, lsof will return an error, which is fine
      console.log('No process found on port 5173 or error occurred:', portError.message)
    }
  } catch (error) {
    console.log('Error in killRunningProcesses:', error.message)
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './', // Added this line to ensure relative paths
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'kill-processes-on-start',
      async buildStart() {
        await killRunningProcesses() // Kill any existing Electron and Vite processes
      }
    }
  ],
  server: {
    port: 5173, // Explicitly set the default port
    strictPort: true // Don't allow automatic port selection
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
