import { type Result } from './result';

/**
 * Infers the safe return type based on whether the input is a thenable (PromiseLike),
 * synchronous, or never (throws).
 *
 * Logic:
 * 1. If T is `never` (function throws), return `Result<T, unknown>`.
 * 2. If T is a thenable (`PromiseLike<U>` — a native `Promise` OR any object with a `.then`,
 *    e.g. a lazy Mongoose `Query` / Knex / TypeORM `QueryBuilder`), return `Promise<Result<U, unknown>>`.
 * 3. Otherwise, return `Result<T, unknown>`.
 *
 * We use `unknown` for the error type because in JavaScript/TypeScript, anything can be thrown
 * (Error, string, number, plain object, null, etc.).
 */
export type SafeExecutionResult<T> = [T] extends [never]
  ? Result<T, unknown>
  : T extends PromiseLike<infer U>
    ? Promise<Result<U, unknown>>
    : Result<T, unknown>;

/**
 * # 🛡️ trySafe
 *
 * Executes a **synchronous** or **asynchronous** function safely, capturing any exceptions
 * and returning a `Result` object.
 *
 * Awaits any **thenable** (`PromiseLike`), not just native `Promise` instances. This matters for
 * lazy thenables such as a Mongoose `Query`, Knex or a TypeORM `QueryBuilder`: they are awaitable
 * (they implement `.then`) but are NOT `instanceof Promise`. Treating them as plain synchronous
 * values would store them WITHOUT ever running them — a silent no-op (the operation never reaches
 * the database, yet `ok` is `true`). Aligning with the language's own `await` (which runs any
 * thenable) closes that trap.
 *
 * Unlike standard try/catch, this preserves the original thrown object (Error, custom object, string, etc.)
 * allowing you to handle libraries that throw plain objects (like FusionAuth or Axios).
 *
 * @param fn - The function to execute (can return a value, a Promise, or any thenable).
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

    const isThenable =
      result != null && typeof (result as { then?: unknown }).then === 'function';

    if (isThenable) {
      // Two-argument `.then` (not `.then().catch()`): `PromiseLike` only guarantees `.then`,
      // so we must not rely on a `.catch` existing on the value (or on what `.then` returns).
      return (result as unknown as PromiseLike<unknown>).then(
        (value: unknown) => ({ ok: true, value }),
        (error: unknown) => ({ ok: false, error }), // Return the error exactly as received
      ) as unknown as SafeExecutionResult<T>;
    }

    return { ok: true, value: result } as unknown as SafeExecutionResult<T>;
  } catch (error) {
    return {
      ok: false,
      error, // Return the error exactly as received
    } as unknown as SafeExecutionResult<T>;
  }
}