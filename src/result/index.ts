/**
 * Represents the result of an operation that might fail.
 *
 * It is a **Discriminated Union** designed to enforce explicit error handling
 * and to integrate seamlessly with pattern matching libraries like `ts-pattern`.
 *
 * @template T The type of the value in case of success.
 * @template E The type of the error in case of failure (defaults to `Error`).
 *
 * @example
 * ### Basic usage with if/else
 * ```ts
 * import { Result } from '@skapxd/result';
 *
 * const outcome = Result.ok(100);
 *
 * if (Result.isOk(outcome)) {
 *   console.log(outcome.value); // TS knows it's Ok
 * }
 * ```
 *
 * @example
 * ### Integration with `ts-pattern` 🎨 (Recommended)
 * ```ts
 * import { Result } from '@skapxd/result';
 * import { match } from 'ts-pattern';
 *
 * function getScore(id: string): Result<number, 'NO_HIT' | 'INVALID'> {
 *   if (!id) return Result.err('INVALID');
 *   // ... search logic ...
 *   return Result.ok(750);
 * }
 *
 * const message = match(getScore('user_1'))
 *   .with({ ok: true }, ({ value }) => `Score: ${value}`)
 *   .with({ ok: false, error: 'NO_HIT' }, () => 'No history found')
 *   .with({ ok: false, error: 'INVALID' }, () => 'Invalid ID')
 *   .exhaustive();
 * ```
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * Successful component of a `Result`.
 * Contains the property `ok: true` and the value in `value`.
 */
export type Ok<T> = { ok: true; value: T };

/**
 * Failed component of a `Result`.
 * Contains the property `ok: false` and the error in `error`.
 */
export type Err<E> = { ok: false; error: E };

/**
 * Alias for Result, inspired by Rust.
 * Useful if you prefer more explicit "safety" terminology.
 */
export type SafeResult<T, E = Error> = Result<T, E>;

export const Result = {
  /**
   * Creates a success instance (`Ok`).
   * @param value The value to wrap.
   * @returns An object `{ ok: true, value }`.
   *
   * @example
   * ```ts
   * const success = Result.ok({ id: 1, name: 'Manuel' });
   * ```
   */
  ok: <T>(value: T): Ok<T> => ({ ok: true, value }),

  /**
   * Creates an error instance (`Err`).
   * @param error The error or reason for failure.
   * @returns An object `{ ok: false, error }`.
   *
   * @example
   * ```ts
   * const failure = Result.err('Could not connect to DB');
   * ```
   */
  err: <E>(error: E): Err<E> => ({ ok: false, error }),

  /**
   * Type Guard: Checks if the result is successful.
   * If it returns `true`, TypeScript automatically infers that `result` is `Ok<T>`.
   *
   * @param result The result to check.
   */
  isOk: <T, E>(result: Result<T, E>): result is Ok<T> => result.ok,

  /**
   * Type Guard: Checks if the result is an error.
   * If it returns `true`, TypeScript automatically infers that `result` is `Err<E>`.
   *
   * @param result The result to check.
   */
  isErr: <T, E>(result: Result<T, E>): result is Err<E> => !result.ok,

  /**
   * Extracts the contained value if it is `Ok`, or returns a default value if it is `Err`.
   * Useful for handling errors quickly with a fallback.
   *
   * @param result The result to evaluate.
   * @param defaultValue Value to return if the result is an error.
   *
   * @example
   * ```ts
   * const port = Result.unwrapOr(configResult, 3000);
   * ```
   */
  unwrapOr: <T, E>(result: Result<T, E>, defaultValue: T): T =>
    result.ok ? result.value : defaultValue,
};
