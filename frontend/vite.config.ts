import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devPort = Number(process.env.PORT) || 5173

export default defineConfig({
  plugins: [react()],

  server: {
    port: devPort,
    strictPort: true,
  },

  build: {
    minify: 'terser',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})