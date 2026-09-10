import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Root-relative alias keeps this config free of node: imports, so no
  // @types/node is needed just to build.
  resolve: { alias: { '@': '/src' } },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // The dish catalogue is the biggest module and rarely changes;
        // give it its own long-cached chunk.
        manualChunks: (id) => (id.includes('/lib/dishes') ? 'dishes' : undefined),
      },
    },
  },
});
