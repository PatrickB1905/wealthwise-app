import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mui/material', '@emotion/react', '@emotion/styled', 'recharts', 'es-toolkit'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          mui: ['@mui/material'],
          emotion: ['@emotion/react', '@emotion/styled'],
          charts: ['recharts'],
        },
      },
    },
  },
})
