import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'], // Solo tests de integración
    alias: {
      '@skapxd/result': path.resolve(__dirname, './dist/index.mjs'), // Apunta a DIST
    },
  },
});
