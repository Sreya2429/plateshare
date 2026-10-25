import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React calls /api/...  and Vite forwards it to the PHP server on port 8000.
// Because the browser only talks to one origin, PHP session cookies just work.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
