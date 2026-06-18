// @ts-check
import { configs as skapxdConfigs } from '@skapxd/eslint-opinionated';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'test-reports/**',
      'coverage/**',
      'eslint.config.mjs',
      'tsup.config.ts',
      'vitest.unit.config.ts',
      'vitest.integration.config.ts',
      // Los tests usan fixtures (numeros magicos como 100/42/750, helpers de
      // arrange, throws a proposito) que las reglas de ARQUITECTURA marcarian como
      // ruido. El preset apunta al codigo publicado; el CLI autocontenido tambien
      // excluye los tests por defecto. Se mantienen fuera a proposito.
      '**/*.spec.ts',
      'tests/**',
    ],
  },
  // Preset `package`: libreria TS dual (bases + type-driven + contrato de exports).
  // OJO: `configs.package` es un objeto de config unico (no un array), por eso va
  // sin spread — a diferencia de `configs.nest`, que si es array.
  skapxdConfigs.package,
  {
    // Sin este `files`, ESLint flat config solo lintea .js/.mjs/.cjs y los .ts
    // quedan fuera del set. Esto los incluye y activa el type-aware (projectService).
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // `trySafe` es la PRIMITIVA que provee el patron Result: no puede consumirse a
    // si misma. Estas tres reglas son intrinsecas a la frontera donde una excepcion
    // (o un thenable) se convierte en Result, no deuda a corregir:
    // - no-try-catch: el try/catch ES como se captura la excepcion para modelarla.
    // - no-promise-chain: el `.then(onOk, onErr)` ES como se envuelve el thenable.
    // - no-unverified-cast: el tipo de retorno condicional `SafeExecutionResult<T>`
    //   no se reduce dentro de la funcion generica, asi que TS exige la asercion.
    files: ['src/try-safe.ts'],
    rules: {
      'skapxd/no-try-catch': 'off',
      'skapxd/no-promise-chain': 'off',
      'skapxd/no-unverified-cast': 'off',
    },
  },
);
