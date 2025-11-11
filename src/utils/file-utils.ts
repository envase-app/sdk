import { BrowserAdapter } from '../adapters/browser';
import { BunAdapter } from '../adapters/bun';
import { DenoAdapter } from '../adapters/deno';
import { NodeAdapter } from '../adapters/node';
import type { Adapter, Runtime } from '../types';
import { ConfigurationError } from '../types/errors';

declare const Bun: unknown;
declare const Deno: {
  version: Record<string, string>;
};
declare const window: {
  document?: unknown;
};
declare const process: {
  versions?: Record<string, string | undefined>;
};

let currentAdapter: Adapter | null = null;

const detectRuntime = (): Runtime => {
  if (typeof Bun !== 'undefined') {
    return 'bun';
  }

  if (typeof Deno !== 'undefined' && typeof Deno.version === 'object') {
    return 'deno';
  }

  if (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    Boolean(process.versions?.node)
  ) {
    return 'node';
  }

  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    return 'browser';
  }

  return 'unknown';
};

const resolveAdapter = (): Adapter => {
  const runtime = detectRuntime();

  switch (runtime) {
    case 'node':
      return NodeAdapter;
    case 'bun':
      return BunAdapter;
    case 'deno':
      return DenoAdapter;
    case 'browser':
      return BrowserAdapter;
    default:
      throw new ConfigurationError('Unsupported runtime for file operations');
  }
};

const getAdapterInstance = (): Adapter => {
  if (!currentAdapter) {
    currentAdapter = resolveAdapter();
  }
  return currentAdapter;
};

export const FileUtils = {
  detectRuntime,

  setAdapter(adapter: Adapter): void {
    currentAdapter = adapter;
  },

  resetAdapter(): void {
    currentAdapter = null;
  },

  getAdapter(): Adapter {
    return getAdapterInstance();
  },

  async readFile(path: string): Promise<string> {
    return await getAdapterInstance().readFile(path);
  },

  async writeFile(path: string, content: string): Promise<void> {
    await getAdapterInstance().writeFile(path, content);
  },

  async ensureDir(path: string): Promise<void> {
    await getAdapterInstance().ensureDir(path);
  },

  getConfigPath(): string {
    return getAdapterInstance().getConfigPath();
  },

  getRuntime(): Runtime {
    return getAdapterInstance().getRuntime();
  },
};
