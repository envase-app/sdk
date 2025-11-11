import { describe, expect, it } from 'vitest';
import { EncryptionService } from '../src/utils/encryption';

describe('EncryptionService', () => {
  it('encrypts and decrypts values symmetrically', async () => {
    const key = await EncryptionService.generateKey();
    const service = new EncryptionService(key);

    const plaintext = 'sensitive-value';
    const encrypted = await service.encrypt(plaintext);

    expect(encrypted).not.toBe(plaintext);

    const decrypted = await service.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('rejects invalid keys', () => {
    expect(() => new EncryptionService('invalid')).toThrowError();
  });
});

