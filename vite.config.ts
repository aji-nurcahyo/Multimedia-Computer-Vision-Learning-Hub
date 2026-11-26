import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-katex': ['katex'],
          'vendor-icons': ['lucide-react'],
          'vendor-export-pptx': ['pptxgenjs'],
          'vendor-export-pdf': ['jspdf'],
        },
      },
    },
  },
});

