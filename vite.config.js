import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      '@assets': '/src/assets', // Alias for assets folder
    },
  },
  plugins: [react()],
});
