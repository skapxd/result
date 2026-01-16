import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // Genera ambos formatos
  dts: true,              // Genera tipos .d.ts
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  // ESTO ES LO NUEVO: Forzamos las extensiones correctas
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
});
