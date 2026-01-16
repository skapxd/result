import { describe, it, expect } from 'vitest';
import { trySafe } from './index';

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
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(Error);
        expect(res.error.message).toBe('sync boom');
      }
    });

    it('should handle thrown non-Error object (string)', () => {
      // Caso borde: alguien hace `throw "error"`
      const res = trySafe(() => {
        throw 'string error';
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(Error);
        expect(res.error.message).toBe('string error');
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
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(Error);
        expect(res.error.message).toBe('async boom');
      }
    });

    it('should handle rejected promise with non-Error object', async () => {
      const res = await trySafe(() => Promise.reject('async string fail'));

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeInstanceOf(Error);
        expect(res.error.message).toBe('async string fail');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle a function explicitly returning a Promise (not async keyword)', async () => {
      // Esto prueba la rama `if (result instanceof Promise)` explícitamente
      const res = await trySafe(() => Promise.resolve(1));
      expect(res).toEqual({ ok: true, value: 1 });
    });
  });
});