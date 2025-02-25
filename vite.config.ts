import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tsconfigPaths from 'vite-tsconfig-paths';


// https://vite.dev/config/
export default defineConfig({
  server: {
    // ['<url>'] or true
    allowedHosts: true
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  plugins: [react(),tsconfigPaths()],
})
