import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    include: [
      'monaco-editor',
      '@monaco-editor/react'
    ]
  },
  define: {
    'process.env': {}
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor', '@monaco-editor/react']
        }
      }
    }
  },
  worker: {
    format: 'es'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
