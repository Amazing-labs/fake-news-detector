import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      'import.meta.env.VITE_BETTER_AUTH_DISABLE': JSON.stringify(
        env.VITE_BETTER_AUTH_DISABLE ?? 'false',
      ),
      'import.meta.env.VITE_BETTER_AUTH_ALLOW_PRODUCTION_BYPASS':
        JSON.stringify(env.VITE_BETTER_AUTH_ALLOW_PRODUCTION_BYPASS ?? 'false'),
    },
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api': {
          target:
            process.env.VITE_SERVER_PROXY_TARGET ?? 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
