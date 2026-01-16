import { type Result } from '../result';

/**
 * # 🛡️ trySafe
 *
 * Executes a **synchronous** or **asynchronous** function safely, capturing any exceptions
 * and returning a `Result` object (inspired by Rust).
 *
 * This allows for handling error flows declaratively without nested `try/catch` blocks.
 *
 * @param fn - The function to execute (can return a value or a Promise).
 * @returns A `Result` object containing the success value or the captured error.
 *
 * @example
 * ```ts
 * // Synchronous
 * const parsed = trySafe(() => JSON.parse(data));
 *
 * // Asynchronous
 * const user = await trySafe(async () => db.findUser(id));
 * ```
 */
export function trySafe<T>(fn: () => Promise<T>): Promise<Result<T>>;
export function trySafe<T>(fn: () => T): Result<T>;
export function trySafe<T>(
  fn: () => T | Promise<T>,
): Result<T> | Promise<Result<T>> {
  try {
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then((value): Result<T> => ({ ok: true, value }))
        .catch(
          (e): Result<T> => ({
            ok: false,
            error: e instanceof Error ? e : new Error(String(e)),
          }),
        );
    }

    return { ok: true, value: result as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}