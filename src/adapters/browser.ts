import type { Adapter, Runtime } from '../types';
import { ConfigurationError } from '../types/errors';

declare const window: {
  localStorage?: Storage;
};

declare class Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const NAMESPACE = 'envase-sdk';

function getStorage(): Storage {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new ConfigurationError(
      'Local storage is not available in the current environment'
    );
  }
  return window.localStorage;
}

function resolveKey(path: string): string {
  return `${NAMESPACE}:${path}`;
}

export const BrowserAdapter: Adapter = {
  async readFile(path: string): Promise<string> {
    const storage = getStorage();
    const key = resolveKey(path);
    const value = storage.getItem(key);
    if (value === null) {
      throw new ConfigurationError(`File not found in storage: ${path}`);
    }
    return value;
  },

  async writeFile(path: string, content: string): Promise<void> {
    const storage = getStorage();
    const key = resolveKey(path);
    storage.setItem(key, content);
  },

  async ensureDir(_path: string): Promise<void> {
    // Directories are a no-op in key/value storage.
  },

  getConfigPath(): string {
    return 'config';
  },

  getRuntime(): Runtime {
    return 'browser';
  },
};
