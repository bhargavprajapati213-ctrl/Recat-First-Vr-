import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the Express server during development
    proxy: { '/api': `http://localhost:${process.env.API_PORT || 3001}` },
  },
});
