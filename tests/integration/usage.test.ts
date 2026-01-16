import { describe, it, expect } from 'vitest';
// Aquí simulamos que somos un usuario externo importando el paquete
import { Result, trySafe } from '@skapxd/result';

describe('Integration: Consumer Usage', () => {
  it('should allow a developer to flow through the happy path', () => {
    // 1. Crear un resultado exitoso manualmente
    const success = Result.ok('Data loaded');
    
    // 2. Verificar isOk
    if (Result.isOk(success)) {
      expect(success.value).toBe('Data loaded');
    } else {
      throw new Error('Should be Ok');
    }

    // 3. Usar unwrapOr
    const value = Result.unwrapOr(success, 'Default');
    expect(value).toBe('Data loaded');
  });

  it('should allow a developer to handle errors gracefully with trySafe', async () => {
    // Simular una función de librería de terceros que falla
    const riskyOperation = async () => {
      throw new Error('Database disconnected');
    };

    // El desarrollador envuelve la llamada
    const result = await trySafe(riskyOperation);

    // Verificamos que obtuvo un error manejado
    expect(Result.isErr(result)).toBe(true);
    
    if (Result.isErr(result)) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('Database disconnected');
    }
  });
});
