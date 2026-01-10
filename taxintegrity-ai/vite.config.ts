import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env from the current directory (taxintegrity-ai folder)
    const env = loadEnv(mode, process.cwd(), '');
    console.log('Building with GEMINI_API_KEY:', env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
    return {
      // When integrated into the main site, the app is hosted at /taxintegrity-ai/
      // Keep dev base at / for Vite dev server convenience.
      base: mode === 'production' ? '/taxintegrity-ai/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
    };
});
