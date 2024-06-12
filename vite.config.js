// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow Vite to be accessed externally
    port: 5173 // Ensure the port is open and accessible
  }
});
