import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

// Plugin to handle chunk loading errors
function chunkErrorRetryPlugin(): Plugin {
  return {
    name: 'chunk-error-retry',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `<script>
          // Handle chunk loading errors by reloading the page once
          window.addEventListener('error', function(event) {
            if (event.message && (
              event.message.includes('Failed to fetch dynamically imported module') ||
              event.message.includes('Importing a module script failed') ||
              event.message.includes('Unable to preload')
            )) {
              const hasReloaded = sessionStorage.getItem('chunk-error-reload');
              if (!hasReloaded) {
                sessionStorage.setItem('chunk-error-reload', 'true');
                window.location.reload();
              } else {
                sessionStorage.removeItem('chunk-error-reload');
                console.error('Chunk loading failed after reload:', event);
              }
            }
          }, true);
          
          // Clear reload flag on successful load
          window.addEventListener('load', function() {
            sessionStorage.removeItem('chunk-error-reload');
          });
        </script>
        </head>`
      );
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const PORT = Number(env.VITE_PORT) || 8081;
  const isProduction = mode === 'production';

  return {
    // Base public path - use CDN origin in production when VITE_CDN_URL is set
    base: env.VITE_CDN_URL || '/',
    plugins: [
      react(),
      chunkErrorRetryPlugin(),
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
          dev: { logLevel: ['error'] },
        },
        overlay: {
          position: 'tl',
          initialIsOpen: false,
        },
      }),
    ],
    resolve: {
      alias: [
        {
          find: /^~(.+)/,
          replacement: path.resolve(process.cwd(), 'node_modules/$1'),
        },
        {
          find: /^src(.+)/,
          replacement: path.resolve(process.cwd(), 'src/$1'),
        },
      ],
    },
    build: {
      // Increase chunk size warning limit (default 500KB → 1000KB)
      chunkSizeWarningLimit: 1000,
      // Generate sourcemap (disabled in production)
      sourcemap: !isProduction,
      // CSS code splitting
      cssCodeSplit: true,
      // Build performance optimization
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction, // Remove console in production
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
        },
        format: {
          comments: false, // Remove comments
        },
      },
      // Rollup options - chunk splitting strategy
      rollupOptions: {
        output: {
          // Manual chunk splitting strategy
          manualChunks: {
            // React core libraries
            'react-vendor': ['react', 'react-dom', 'react-router'],
            
            // Redux related
            'redux-vendor': ['react-redux', 'redux', 'redux-persist', '@reduxjs/toolkit'],
            
            // MUI core
            'mui-core': [
              '@mui/material',
              '@mui/system',
              '@emotion/react',
              '@emotion/styled',
              '@emotion/cache',
            ],
            
            // MUI extended components
            'mui-extended': [
              '@mui/lab',
              '@mui/x-data-grid',
              '@mui/x-date-pickers',
              '@mui/x-tree-view',
            ],
            
            // Form related
            'form-vendor': [
              'react-hook-form',
              '@hookform/resolvers',
              'zod',
            ],
            
            // Utilities
            'utils-vendor': [
              'axios',
              'dayjs',
              'es-toolkit',
              'nprogress',
            ],
            
            // i18n
            'i18n-vendor': [
              'i18next',
              'react-i18next',
              'i18next-browser-languagedetector',
              'i18next-resources-to-backend',
            ],
            
            // Animation & UI
            'animation-vendor': [
              'framer-motion',
              'embla-carousel',
              'embla-carousel-react',
              'embla-carousel-autoplay',
              'embla-carousel-auto-height',
              'embla-carousel-auto-scroll',
              'embla-carousel-fade',
            ],
            
            // Miscellaneous
            'misc-vendor': [
              'react-helmet-async',
              'react-hot-toast',
              'socket.io-client',
              'simplebar-react',
              'react-dropzone',
              'react-phone-number-input',
            ],
          },
          // Chunk filename pattern
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()
              : 'chunk';
            return `assets/js/${chunkInfo.name}-[hash].js`;
          },
          // Entry filename
          entryFileNames: 'assets/js/[name]-[hash].js',
          // CSS filename
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
              return `assets/images/[name]-[hash].${ext}`;
            }
            if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].${ext}`;
            }
            if (/\.css$/i.test(assetInfo.name)) {
              return `assets/css/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          },
        },
      },
      // Asset inline size limit (assets under 4KB are inlined as base64)
      assetsInlineLimit: 4096,
    },
    // Optimization options
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        'axios',
      ],
      exclude: ['@iconify/react'],
    },
    server: {
      port: PORT,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_SERVER_URL || 'http://localhost:5050',
          changeOrigin: true,
        },
        '/socket.io': {
          target: env.VITE_SERVER_URL || 'http://localhost:5050',
          changeOrigin: true,
          ws: true,
        },
      },
      ...(env.VITE_HMR_CLIENT_PORT
        ? {
            hmr: {
              host: env.VITE_HMR_HOST || undefined,
              clientPort: Number(env.VITE_HMR_CLIENT_PORT),
            },
          }
        : {}),
    },
    preview: { port: PORT, host: true },
  };
});
