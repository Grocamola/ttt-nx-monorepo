import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/styles/styles',

  plugins: [react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  resolve: {
    alias: {
      '@my-org/styles': resolve(__dirname, '../../libs/styles/styles/src/index.ts'),
    },
  },
  server: {
    watch: {
      usePolling: true, 
    },
  },
  test: {
    watch: false,
    globals: true,
    cache: { dir: '../../../node_modules/.vitest/libs/styles/styles' },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/styles/styles',
      provider: 'v8',
    },
  },
});
