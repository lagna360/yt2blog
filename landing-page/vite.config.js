import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { exec } from 'child_process'
import { promisify } from 'util'
import { resolve } from 'path'

const execPromise = promisify(exec)

// Function to kill process on the default port (5174)
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
  plugins: [
    // First plugin should be the Tailwind CSS Vite plugin
    tailwindcss(),
    react(),
    {
      name: 'kill-port-on-start',
      async buildStart() {
        await killProcessOnPort(5174)
      }
    }
  ],
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
