import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from '@sentry/vite-plugin';


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]___[hash:base64:5]',
      },
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
    plugins: [
      react(),
      tsconfigPaths(),
      isProduction && sentryVitePlugin({
        org: "aparte",
        project: "landing-page",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          filesToDeleteAfterUpload: ["./dist/**/*.map"],
        },
      }),
    ].filter(Boolean),
    server: {
      host: true,
      port: 3000,
      watch: {
        usePolling: true,
        interval: 100,
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/.git/**',
        ],
      },
      hmr: {
        overlay: true,
        timeout: 1000,
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    build: {
      target: 'esnext',
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  }
})
