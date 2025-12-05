import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the existing code using process.env.API_KEY to work
    // by pointing it to the runtime configuration injected by Docker
    'process.env.API_KEY': 'window.env.API_KEY'
  }
});