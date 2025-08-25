import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Prod-tuning: minify hardt, moderne target, split vendor
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',            // unngå legacy output
    minify: 'esbuild',           // rask og effektiv minify
    sourcemap: false,            // fjern sourcemaps i prod
    cssCodeSplit: true,          // split CSS per chunk
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // bare for ro i konsollen
    rollupOptions: {
      output: {
        // legg react* i egen vendor-chunk
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
    // Ikke polyfill modulepreload i moderne browsere
    modulePreload: { polyfill: false },
  },
  esbuild: {
    // kutt “støy”
    drop: ['console', 'debugger'],
  },
})
