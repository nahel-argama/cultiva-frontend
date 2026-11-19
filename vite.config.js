import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_API_BASE_URL } = loadEnv(mode, root)
  const tunnel = /^https:\/\/[^/]+\.ngrok-free\.dev(?:\/|$)/i.test(VITE_API_BASE_URL ?? '')
    ? new URL(VITE_API_BASE_URL)
    : null

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: tunnel ? {
      proxy: {
        '/storage/': {
          target: tunnel.origin,
          changeOrigin: true,
          headers: { 'ngrok-skip-browser-warning': '1' },
          configure(proxy) {
            proxy.on('proxyReq', (request) => {
              request.removeHeader('cookie')
              request.removeHeader('authorization')
            })
          },
        },
      },
    } : undefined,
  }
})
