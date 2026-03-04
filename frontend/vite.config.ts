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