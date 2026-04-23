import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname, 'demo'),
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@medalsocial/meda/styles.css',
        replacement: resolve(__dirname, 'src/styles/globals.css'),
      },
      {
        find: '@medalsocial/meda',
        replacement: resolve(__dirname, 'src/index.ts'),
      },
    ],
  },
  server: { port: 5175 },
  build: {
    outDir: resolve(__dirname, 'demo/dist'),
    emptyOutDir: true,
  },
});
