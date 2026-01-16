# @skapxd/result

[![CI](https://github.com/skapxd/result/actions/workflows/ci.yml/badge.svg)](https://github.com/skapxd/result/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/skapxd/result/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/skapxd/result)
[![npm version](https://badge.fury.io/js/@skapxd%2Fresult.svg)](https://badge.fury.io/js/@skapxd%2Fresult)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🛡️ **Type-safe error handling for TypeScript, inspired by Rust.**

Stop throwing exceptions. Start returning results.
This library provides a lightweight `Result` type and a `trySafe` utility to handle synchronous and asynchronous operations without `try/catch` hell.

## 📦 Installation

```bash
npm install @skapxd/result
# or
pnpm add @skapxd/result
# or
yarn add @skapxd/result
```

## 🚀 Features

-   **Zero dependencies**: Lightweight and fast.
-   **Type-safe**: Built with strict TypeScript configuration.
-   **Rust-inspired**: Use `Ok` and `Err` semantics.
-   **Pattern Matching Ready**: Designed to work perfectly with `ts-pattern`.
-   **Universal**: Works in Node.js, Deno, Bun, and Browsers (ESM & CJS).

## 💡 Usage

### 1. Basic Usage (`Result`)

```ts
import { Result } from '@skapxd/result';

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Result.err('Cannot divide by zero');
  }
  return Result.ok(a / b);
}

const outcome = divide(10, 0);

if (Result.isOk(outcome)) {
  console.log('Result:', outcome.value); // TS infers 'number'
} else {
  console.error('Error:', outcome.error); // TS infers 'string'
}
```

### 2. Safer Execution (`trySafe`)

Wrap risky operations (like parsing JSON or fetching data) to automatically catch errors.

```ts
import { trySafe } from '@skapxd/result';

// Synchronous
const jsonResult = trySafe(() => JSON.parse('{"valid": false}'));

// Asynchronous
const apiResult = await trySafe(async () => {
  const response = await fetch('/api/user');
  if (!response.ok) throw new Error('Network error');
  return response.json();
});

if (Result.isErr(apiResult)) {
  console.error('Failed to fetch:', apiResult.error);
  return;
}

console.log('User data:', apiResult.value);
```

### 3. Professional Error Modeling (Best Practice)

Avoid "magic strings". Define your errors as **Discriminated Unions**. This gives you autocompletion and allows you to attach metadata to specific errors.

```ts
import { Result } from '@skapxd/result';
import { match } from 'ts-pattern';

// 1. Define your specific error types
type ApiError = 
  | { type: 'NOT_FOUND'; resource: string }
  | { type: 'UNAUTHORIZED'; reason: string }
  | { type: 'SERVER_ERROR' };

// 2. Use Result with your error type
function getUser(id: string): Result<User, ApiError> {
  if (!id) return Result.err({ type: 'NOT_FOUND', resource: 'User' });
  if (!isValid(id)) return Result.err({ type: 'UNAUTHORIZED', reason: 'Bad Token' });
  
  return Result.ok({ id, name: 'Alice' });
}

// 3. Handle it safely with pattern matching
const message = match(getUser('123'))
  .with({ ok: true }, ({ value }) => `Hello ${value.name}`)
  
  // TypeScript knows 'resource' exists only on NOT_FOUND
  .with({ ok: false, error: { type: 'NOT_FOUND' } }, ({ error }) => `${error.resource} missing`)
  
  // TypeScript knows 'reason' exists only on UNAUTHORIZED
  .with({ ok: false, error: { type: 'UNAUTHORIZED' } }, ({ error }) => `Auth failed: ${error.reason}`)
  
  // Catch-all for other errors
  .with({ ok: false }, () => 'Something went wrong')
  .exhaustive();
```

## 🛠️ Development

This project uses **pnpm** (recommended) or npm.

### Commands

-   **`npm run build`**: Compiles the package using `tsup` (ESM + CJS).
-   **`npm run test`**: Runs unit and integration tests.
-   **`npm run test:ui`**: Opens the interactive Vitest UI.
-   **`npm run test:unit`**: Runs only unit tests (fast).
-   **`npm run test:integration`**: Builds the package and runs integration tests against `dist`.
-   **`npm run report:coverage`**: View HTML coverage report.

## 📄 License

MIT