import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { exec } from 'child_process'
import { promisify } from 'util'
import { resolve } from 'path'

const execPromise = promisify(exec)

// Function to kill process on the default port (5173)
async function killProcessOnPort(port) {
  try {
    // For macOS
    const { stdout } = await execPromise(`lsof -i :${port} -t`)
    if (stdout.trim()) {
      const pid = stdout.trim()
      console.log(`Killing process ${pid} on port ${port}`)
      await execPromise(`kill -9 ${pid}`)
    }
  } catch (error) {
    // If no process is found, lsof will return an error, which is fine
    console.log(`No process found on port ${port} or error occurred: ${error.message}`)
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './', // Added this line to ensure relative paths
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'kill-port-on-start',
      async buildStart() {
        await killProcessOnPort(5173) // Default Vite port
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
