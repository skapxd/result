import { describe, it, expect } from 'vitest';
import { Result } from './index'; // Import relativo local
import { match } from 'ts-pattern';

describe('Result API', () => {
  describe('Creation', () => {
    it('should create an Ok result', () => {
      const res = Result.ok(10);
      expect(res).toEqual({ ok: true, value: 10 });
    });

    it('should create an Err result', () => {
      const res = Result.err('failed');
      expect(res).toEqual({ ok: false, error: 'failed' });
    });
  });

  describe('Type Guards', () => {
    it('isOk should return true for Ok result', () => {
      const res = Result.ok('yes');
      expect(Result.isOk(res)).toBe(true);
    });

    it('isOk should return false for Err result', () => {
      const res = Result.err('no');
      expect(Result.isOk(res)).toBe(false);
    });

    it('isErr should return true for Err result', () => {
      const res = Result.err('error');
      expect(Result.isErr(res)).toBe(true);
    });

    it('isErr should return false for Ok result', () => {
      const res = Result.ok('success');
      expect(Result.isErr(res)).toBe(false);
    });
  });

  describe('Utilities', () => {
    it('unwrapOr should return the value if Result is Ok', () => {
      const res = Result.ok(42);
      expect(Result.unwrapOr(res, 0)).toBe(42);
    });

    it('unwrapOr should return the default value if Result is Err', () => {
      const res = Result.err('oops');
      expect(Result.unwrapOr(res, 100)).toBe(100);
    });
  });
});

describe('Result Integration with ts-pattern', () => {
  it('should match correctly with exhaustive pattern matching', () => {
    const getScore = (found: boolean): Result<number, 'NO_HIT'> => {
        if (!found) return Result.err('NO_HIT');
        return Result.ok(750);
    };

    const runMatch = (found: boolean) => 
        match(getScore(found))
            .with({ ok: true }, ({ value }) => `Score: ${value}`)
            .with({ ok: false, error: 'NO_HIT' }, () => 'Sin historial')
            .exhaustive();

    expect(runMatch(true)).toBe('Score: 750');
    expect(runMatch(false)).toBe('Sin historial');
  });

  it('should handle complex error objects', () => {
    type MyError = { type: 'NETWORK_ERROR'; retries: number } | { type: 'AUTH_ERROR'; userId: string };
    
    const performAction = (scenario: 'success' | 'net' | 'auth'): Result<string, MyError> => {
      if (scenario === 'net') return Result.err({ type: 'NETWORK_ERROR', retries: 3 });
      if (scenario === 'auth') return Result.err({ type: 'AUTH_ERROR', userId: 'u_123' });
      return Result.ok('Action complete');
    };

    const handleResult = (scenario: 'success' | 'net' | 'auth') =>
      match(performAction(scenario))
        .with({ ok: true }, ({ value }) => `Success: ${value}`)
        // Pattern matching profundo dentro del objeto de error
        .with({ ok: false, error: { type: 'NETWORK_ERROR' } }, ({ error }) => `Retrying... (${error.retries} left)`)
        .with({ ok: false, error: { type: 'AUTH_ERROR' } }, ({ error }) => `User ${error.userId} is not logged in`)
        .exhaustive();

    expect(handleResult('success')).toBe('Success: Action complete');
    expect(handleResult('net')).toBe('Retrying... (3 left)');
    expect(handleResult('auth')).toBe('User u_123 is not logged in');
  });
});