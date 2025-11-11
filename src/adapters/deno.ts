import { dirname, join, resolve } from 'node:path';
import type { Adapter, Runtime } from '../types';

declare const Deno: {
  readTextFile(path: string): Promise<string>;
  writeTextFile(path: string, content: string): Promise<void>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  env: {
    get(key: string): string | undefined;
  };
  build: {
    os: string;
  };
};

function getHomeDirectory(): string | undefined {
  return (
    Deno.env.get('HOME') ??
    Deno.env.get('USERPROFILE') ??
    (Deno.build.os === 'windows' ? Deno.env.get('HOMEPATH') : undefined)
  );
}

function expandPath(path: string): string {
  if (path.startsWith('~')) {
    const home = getHomeDirectory();
    if (home) {
      return join(home, path.slice(1));
    }
    return path.slice(1);
  }
  return resolve(path);
}

export const DenoAdapter: Adapter = {
  async readFile(path: string): Promise<string> {
    const resolved = expandPath(path);
    return await Deno.readTextFile(resolved);
  },

  async writeFile(path: string, content: string): Promise<void> {
    const resolved = expandPath(path);
    await ensureDirectory(dirname(resolved));
    await Deno.writeTextFile(resolved, content);
  },

  async ensureDir(path: string): Promise<void> {
    const resolved = expandPath(path);
    await ensureDirectory(resolved);
  },

  getConfigPath(): string {
    const home = getHomeDirectory();
    if (!home) {
      return '.envase/config.json';
    }
    return join(home, '.envase', 'config.json');
  },

  getRuntime(): Runtime {
    return 'deno';
  },
};

async function ensureDirectory(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true });
}
