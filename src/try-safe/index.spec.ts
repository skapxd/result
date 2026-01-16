import { describe, it, expect } from 'vitest';
import { match } from 'ts-pattern';
import { trySafe } from './index';
import { Result } from '../result';

describe('trySafe', () => {
  describe('Synchronous operations', () => {
    it('should handle success returning value', () => {
      const res = trySafe(() => 100);
      expect(res).toEqual({ ok: true, value: 100 });
    });

    it('should handle thrown Error', () => {
      const res = trySafe(() => {
        throw new Error('sync boom');
      });
      
      expect(res.ok).toBe(false);
      if (Result.isErr(res) && res.error instanceof Error) {
        expect(res.error.message).toBe('sync boom');
      }
    });

    it('should handle thrown non-Error object (string) without wrapping', () => {
      const res = trySafe(() => {
        throw 'string error';
      });

      expect(res.ok).toBe(false);
      // Validamos que recibimos el string puro, no un Error('string error')
      if (Result.isErr(res)) {
        expect(res.error).toBe('string error'); 
      }
    });

    it('should handle thrown plain objects (FusionAuth style)', () => {
      // Tu caso de uso específico
      const res = trySafe(() => {
        // eslint-disable-next-line no-throw-literal
        throw { code: 404, reason: 'User not found' };
      });

      expect(res.ok).toBe(false);
      if (Result.isErr(res)) {
        // Aquí demostramos que el objeto se conserva intacto
        expect(res.error).toEqual({ code: 404, reason: 'User not found' });
      }
    });
  });

  describe('Asynchronous operations', () => {
    it('should handle resolved promise', async () => {
      const res = await trySafe(async () => 'async success');
      expect(res).toEqual({ ok: true, value: 'async success' });
    });

    it('should handle rejected promise with Error', async () => {
      const res = await trySafe(async () => {
        throw new Error('async boom');
      });

      expect(res.ok).toBe(false);
      if (Result.isErr(res) && res.error instanceof Error) {
        expect(res.error.message).toBe('async boom');
      }
    });
  });

  describe('Integration with ts-pattern', () => {
    it('should cleanly match trySafe results', () => {
      const parseConfig = (json: string) => trySafe(() => {
        const parsed = JSON.parse(json);
        if (!parsed.enabled) throw new Error('Config disabled');
        return parsed.enabled as boolean;
      });

      const getStatus = (json: string) => 
        match(parseConfig(json))
          .with({ ok: true, value: true }, () => 'Active')
          .with({ ok: true, value: false }, () => 'Inactive')
          // Pattern matching funciona increíble con 'unknown' si macheas la estructura
          .with({ ok: false, error: { message: 'Config disabled' } }, () => 'Failed: Disabled')
          .with({ ok: false }, () => 'Failed: Generic')
          .exhaustive();

      expect(getStatus('{"enabled": true}')).toBe('Active');
      expect(getStatus('{"enabled": false}')).toBe('Failed: Disabled');
      expect(getStatus('invalid')).toBe('Failed: Generic');
    });
  });
});