import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url';


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
    plugins: [react(),tsconfigPaths()],
    // Explicit aliases so the Rollup production build resolves `@/` and `~/`
    // reliably on all platforms. (vite-tsconfig-paths alone fails to resolve
    // these during `vite build`, especially on Windows.)
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
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
      sourcemap: !isProduction,
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
