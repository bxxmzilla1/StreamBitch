import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon128.png', 'icon48.png', 'icon16.png'],
      manifest: {
        name: 'StreamBitch',
        short_name: 'StreamBitch',
        description: 'Monitor Chaturbate model streams',
        theme_color: '#f47425',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon16.png',
            sizes: '16x16',
            type: 'image/png'
          },
          {
            src: '/icon48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          {
            src: '/icon128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cbxyz\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'stream-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
