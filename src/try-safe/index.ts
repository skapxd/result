import { type Result } from '../result';

/**
 * Infers the safe return type based on whether the input is a Promise, synchronous, or never (throws).
 *
 * Logic:
 * 1. If T is `never` (function throws), return `Result<T, unknown>`.
 * 2. If T is a `Promise<U>`, return `Promise<Result<U, unknown>>`.
 * 3. Otherwise, return `Result<T, unknown>`.
 *
 * We use `unknown` for the error type because in JavaScript/TypeScript, anything can be thrown
 * (Error, string, number, plain object, null, etc.).
 */
export type SafeExecutionResult<T> = [T] extends [never]
  ? Result<T, unknown>
  : T extends Promise<infer U>
    ? Promise<Result<U, unknown>>
    : Result<T, unknown>;

/**
 * # 🛡️ trySafe
 *
 * Executes a **synchronous** or **asynchronous** function safely, capturing any exceptions
 * and returning a `Result` object.
 *
 * Unlike standard try/catch, this preserves the original thrown object (Error, custom object, string, etc.)
 * allowing you to handle libraries that throw plain objects (like FusionAuth or Axios).
 *
 * @param fn - The function to execute (can return a value or a Promise).
 * @returns A `Result` object containing the success value or the captured error (as unknown).
 *
 * @example
 * ```ts
 * const res = trySafe(() => someLib.action());
 *
 * if (Result.isErr(res)) {
 *   // Type narrowing is required because error is unknown
 *   if (res.error instanceof Error) console.log(res.error.message);
 *   else console.log('Unknown error object:', res.error);
 * }
 * ```
 */
export function trySafe<T>(fn: () => T): SafeExecutionResult<T> {
  try {
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then((value: unknown) => ({ ok: true, value }))
        .catch((error: unknown) => ({
          ok: false,
          error, // Return the error exactly as received
        })) as any;
    }

    return { ok: true, value: result } as any;
  } catch (error) {
    return {
      ok: false,
      error, // Return the error exactly as received
    } as any;
  }
}