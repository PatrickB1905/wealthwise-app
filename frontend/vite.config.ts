import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const devPort = Number(process.env.PORT) || 5173

function injectViteEnvPlugin(): Plugin {
  let resolved: ResolvedConfig

  return {
    name: 'wealthwise-inject-vite-env',
    apply: 'serve',
    configResolved(config) {
      resolved = config
    },
    transformIndexHtml(html) {
      const envJson = JSON.stringify(resolved.env)

      return html.replace(
        '</head>',
        [
          '<script>',
          `globalThis.__VITE_ENV__ = ${envJson};`,
          '</script>',
          '</head>',
        ].join('')
      )
    },
  }
}

function injectViteEnvPluginBuild(): Plugin {
  let resolved: ResolvedConfig

  return {
    name: 'wealthwise-inject-vite-env-build',
    apply: 'build',
    configResolved(config) {
      resolved = config
    },
    transformIndexHtml(html) {
      const envJson = JSON.stringify(resolved.env)
      return html.replace(
        '</head>',
        [
          '<script>',
          `globalThis.__VITE_ENV__ = ${envJson};`,
          '</script>',
          '</head>',
        ].join('')
      )
    },
  }
}

function readEnv(name: string, fallback: string): string {
  const raw = process.env[name]
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.length) return trimmed
  }
  return fallback
}

export default defineConfig({
  plugins: [react(), injectViteEnvPlugin(), injectViteEnvPluginBuild()],

  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },

  server: {
    port: devPort,
    strictPort: true,

    /**
     * Development API gateway (Vite dev server)
     *
     * Purpose:
     * - Allows the frontend to run without Docker
     * - Routes /api/* requests to backend services
     *
     * Configuration:
     * - Targets controlled by VITE_DEV_*_PROXY_TARGET env variables
     * - Defaults match docker-compose exposed ports
     */
    proxy: {
      '/api/positions': {
        target: readEnv('VITE_DEV_POSITIONS_PROXY_TARGET', 'http://localhost:4000'),
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/positions/, '/api'),
      },
      '/api/market-data': {
        target: readEnv('VITE_DEV_MARKET_DATA_PROXY_TARGET', 'http://localhost:5000'),
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/market-data/, '/api'),
      },
      '/api/analytics': {
        target: readEnv('VITE_DEV_ANALYTICS_PROXY_TARGET', 'http://localhost:7000'),
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/analytics/, '/api'),
      },
      '/api/news': {
        target: readEnv('VITE_DEV_NEWS_PROXY_TARGET', 'http://localhost:6500'),
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/news/, '/api'),
      },

      '/socket.io': {
        target: readEnv('VITE_DEV_POSITIONS_PROXY_TARGET', 'http://localhost:4000'),
        ws: true,
        changeOrigin: true,
      },
    },
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