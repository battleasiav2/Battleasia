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
  const PORT = Number(env.VITE_PORT) || 8082;
  const isProduction = mode === 'production';

  return {
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
    chunkSizeWarningLimit: 1000,
    sourcemap: !isProduction,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: isProduction,
        drop_debugger: isProduction,
        pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
      },
      format: { comments: false },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'redux-vendor': ['react-redux', 'redux', 'redux-persist', '@reduxjs/toolkit'],
          'mui-core': ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled', '@emotion/cache'],
          'utils-vendor': ['axios', 'dayjs', 'es-toolkit', 'nprogress'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-resources-to-backend'],
          'animation-vendor': ['framer-motion'],
          'misc-vendor': ['react-helmet-async', 'react-hot-toast', 'socket.io-client', 'simplebar-react'],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop() || '';
          if (/png|jpe?g|svg|gif|webp|avif/i.test(ext)) return `assets/images/[name]-[hash].${ext}`;
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) return `assets/fonts/[name]-[hash].${ext}`;
          if (/css/i.test(ext)) return `assets/css/[name]-[hash].${ext}`;
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router', '@mui/material', '@emotion/react', '@emotion/styled', 'axios'],
    exclude: ['@iconify/react'],
  },
  server: {
    port: PORT,
    host: true,
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
