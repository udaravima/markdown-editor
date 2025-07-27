import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Set base to './' for relative paths instead of absolute paths
  base: './',
  
  // Root directory
  root: '.',
  
  // Public directory (for static assets that should be copied as-is)
  publicDir: 'public',
  
  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    
    // Clean the output directory before building
    emptyOutDir: true,
    
    // Asset handling
    assetsDir: 'assets',
    
    // Rollup options for more control over the build
    rollupOptions: {
      // External dependencies that shouldn't be bundled
      external: [],
      
      // Input configuration - specify your entry point
      input: {
        main: resolve(__dirname, 'index.html')
      },
      
      // Output configuration
      output: {
        // Configure asset file names
        assetFileNames: (assetInfo) => {
          // Keep CSS files with a simple naming pattern
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          // Keep other assets with their original structure
          return 'assets/[name]-[hash][extname]';
        },
        
        // Configure chunk file names for JS files
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    
    // Source map generation for debugging
    sourcemap: true
  },
  
  // Development server configuration
  server: {
    // Port for dev server
    port: 3000,
    
    // Open browser automatically
    open: true,
    
    // CORS configuration if needed
    cors: true
  },
  
  // Preview server configuration (for 'npm run preview')
  preview: {
    port: 4173,
    open: true
  },
  
  // Resolve configuration
  resolve: {
    // Add alias if needed
    alias: {
      // Example: '@': path.resolve(__dirname, 'src')
    }
  }
});
