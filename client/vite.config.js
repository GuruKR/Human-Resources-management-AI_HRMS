import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 🔧  make Vite use PostCSS directly
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: { plugins: [tailwindcss(), autoprefixer()] },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
