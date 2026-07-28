import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Simulador de Presidente',
        short_name: 'Presidente',
        description:
          'Jogo de estratégia política: monte um candidato, sobreviva à campanha ou administre um regime inteiro.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0e0f0e',
        theme_color: '#243026',
        categories: ['games', 'education', 'strategy'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Modo Campanha', short_name: 'Campanha', url: './#/campanha/draft' },
          { name: 'Modo Regime', short_name: 'Regime', url: './#/regime' },
        ],
      },
      workbox: {
        // O jogo é inteiramente client-side: dá para pré-cachear tudo e rodar
        // offline depois da primeira visita.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
