import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import type { Adapter, Runtime } from '../types';

declare const Bun: {
  file(path: string): {
    exists(): Promise<boolean>;
    text(): Promise<string>;
  };
  write(path: string, content: string): Promise<void>;
};

function expandPath(path: string): string {
  if (path.startsWith('~')) {
    return join(homedir(), path.slice(1));
  }
  return resolve(path);
}

export const BunAdapter: Adapter = {
  async readFile(path: string): Promise<string> {
    const resolved = expandPath(path);
    const file = Bun.file(resolved);
    if (!(await file.exists())) {
      throw new Error(`File not found: ${resolved}`);
    }
    return await file.text();
  },

  async writeFile(path: string, content: string): Promise<void> {
    const resolved = expandPath(path);
    await ensureDirectory(dirname(resolved));
    await Bun.write(resolved, content);
  },

  async ensureDir(path: string): Promise<void> {
    const resolved = expandPath(path);
    await ensureDirectory(resolved);
  },

  getConfigPath(): string {
    return join(homedir(), '.envase', 'config.json');
  },

  getRuntime(): Runtime {
    return 'bun';
  },
};

async function ensureDirectory(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}
