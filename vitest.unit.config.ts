import { defineConfig } from 'vitest/config';
import path from 'path';

// Definimos dónde se guardarán los reportes
const reportsDir = path.resolve(__dirname, 'test-reports');

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'], // Solo tests unitarios
    
    // Configuración de Reportes de Test (Éxito/Fallo)
    reporters: ['default', 'html'],
    outputFile: path.resolve(reportsDir, 'unit/index.html'),

    alias: {
      '@skapxd/result': path.resolve(__dirname, './src/index.ts'),
    },

    // Configuración de Cobertura de Código
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'], // 'text' para ver resumen en consola, 'html' para web
      reportsDirectory: path.resolve(reportsDir, 'coverage'),
      include: ['src/**/*.ts'], // Solo medir código fuente
      exclude: [
        'src/**/*.spec.ts', // No medir tests
        'src/index.ts',     // Opcional: Excluir barriles si no tienen lógica
        'tests/**/*',
        'dist/**/*',
      ],
      // Umbrales opcionales (fail si baja de X%)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});