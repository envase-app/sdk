import { EncryptionError } from '../types/errors';

declare const btoa: (data: string) => string;
declare const atob: (data: string) => string;

const IV_LENGTH = 12; // AES-GCM recommended IV length (96 bits)
const KEY_LENGTH_BYTES = 32; // 256-bit key

type KeyUsageOption = 'encrypt' | 'decrypt';

type CryptoKeyLike = unknown;

interface CryptoSubtleLike {
  encrypt(
    algorithm: { name: 'AES-GCM'; iv: Uint8Array },
    key: CryptoKeyLike,
    data: ArrayBufferView
  ): Promise<ArrayBuffer>;
  decrypt(
    algorithm: { name: 'AES-GCM'; iv: Uint8Array },
    key: CryptoKeyLike,
    data: ArrayBufferView
  ): Promise<ArrayBuffer>;
  importKey(
    format: 'raw',
    keyData: ArrayBufferView,
    algorithm: { name: 'AES-GCM' },
    extractable: boolean,
    keyUsages: KeyUsageOption[]
  ): Promise<CryptoKeyLike>;
}

interface CryptoLike {
  subtle: CryptoSubtleLike;
  getRandomValues<T extends ArrayBufferView>(array: T): T;
}

async function resolveCrypto(): Promise<CryptoLike> {
  if (typeof globalThis.crypto !== 'undefined') {
    return globalThis.crypto as CryptoLike;
  }

  if (typeof process !== 'undefined' && process.versions?.node) {
    const { webcrypto } = await import('node:crypto');
    return webcrypto as CryptoLike;
  }

  throw new EncryptionError(
    'Web Crypto API is not available in this environment'
  );
}

function hexStringToBytes(hex: string): Uint8Array {
  const normalised = hex.replace(/^0x/, '').toLowerCase();
  if (normalised.length !== KEY_LENGTH_BYTES * 2) {
    throw new EncryptionError(
      `Encryption key must be ${KEY_LENGTH_BYTES * 2} hex characters`
    );
  }

  const bytes = new Uint8Array(KEY_LENGTH_BYTES);
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = normalised.slice(i * 2, i * 2 + 2);
    const parsed = Number.parseInt(byte, 16);
    if (Number.isNaN(parsed)) {
      throw new EncryptionError('Encryption key must be a valid hex string');
    }
    bytes[i] = parsed;
  }
  return bytes;
}

function randomBytes(length: number, crypto: CryptoLike): Uint8Array {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return buffer;
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const size = arrays.reduce((total, current) => total + current.length, 0);
  const merged = new Uint8Array(size);
  let offset = 0;
  for (const array of arrays) {
    merged.set(array, offset);
    offset += array.length;
  }
  return merged;
}

function toBase64(data: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(data).toString('base64');
  }

  let binary = '';
  for (const value of data) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary);
}

function fromBase64(encoded: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(encoded, 'base64'));
  }

  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToHex(data: Uint8Array): string {
  return Array.from(data)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

export class EncryptionService {
  private readonly keyData: Uint8Array;
  private cryptoPromise?: Promise<CryptoLike>;

  constructor(key: string) {
    this.keyData = hexStringToBytes(key);
  }

  async encrypt(plaintext: string): Promise<string> {
    try {
      const crypto = await this.getCrypto();
      const subtleKey = await this.importKey(crypto);
      const iv = randomBytes(IV_LENGTH, crypto);
      const encoded = new TextEncoder().encode(plaintext);

      const cipherBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        subtleKey,
        encoded
      );

      const cipherBytes = new Uint8Array(cipherBuffer);
      const payload = concatUint8Arrays(iv, cipherBytes);
      return toBase64(payload);
    } catch (error) {
      if (error instanceof EncryptionError) {
        throw error;
      }
      throw new EncryptionError('Failed to encrypt data');
    }
  }

  async decrypt(encoded: string): Promise<string> {
    try {
      const crypto = await this.getCrypto();
      const subtleKey = await this.importKey(crypto);
      const data = fromBase64(encoded);

      const iv = data.slice(0, IV_LENGTH);
      const cipher = data.slice(IV_LENGTH);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        subtleKey,
        cipher
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      if (error instanceof EncryptionError) {
        throw error;
      }
      throw new EncryptionError('Failed to decrypt data');
    }
  }

  static async generateKey(): Promise<string> {
    const crypto = await resolveCrypto();
    const keyBytes = randomBytes(KEY_LENGTH_BYTES, crypto);
    return bytesToHex(keyBytes);
  }

  private async getCrypto(): Promise<CryptoLike> {
    if (!this.cryptoPromise) {
      this.cryptoPromise = resolveCrypto();
    }
    return this.cryptoPromise;
  }

  private async importKey(crypto: CryptoLike): Promise<CryptoKeyLike> {
    return await crypto.subtle.importKey(
      'raw',
      this.keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
}
