import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: './setupTests.tsx',
    globals: true,
    exclude: ['node_modules', '.direnv/**', '**/.{idea,git,cache,output,temp}/**'],
  },
});
