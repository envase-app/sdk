import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import type { Adapter, Runtime } from '../types';

function expandPath(path: string): string {
  if (path.startsWith('~')) {
    return join(homedir(), path.slice(1));
  }
  return resolve(path);
}

export const NodeAdapter: Adapter = {
  async readFile(path: string): Promise<string> {
    const resolved = expandPath(path);
    return await fs.readFile(resolved, 'utf8');
  },

  async writeFile(path: string, content: string): Promise<void> {
    const resolved = expandPath(path);
    await ensureDirectory(dirname(resolved));
    await fs.writeFile(resolved, content, 'utf8');
  },

  async ensureDir(path: string): Promise<void> {
    const resolved = expandPath(path);
    await ensureDirectory(resolved);
  },

  getConfigPath(): string {
    return join(homedir(), '.envase', 'config.json');
  },

  getRuntime(): Runtime {
    return 'node';
  },
};

async function ensureDirectory(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}
