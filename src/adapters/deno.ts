import { Adapter, Runtime } from '../types';

export const DenoAdapter: Adapter = {
  async readFile(path: string): Promise<string> {
    // This is a placeholder implementation
    // In a real implementation, you would use Deno's file system API
    throw new Error('DenoAdapter.readFile not implemented');
  },

  async writeFile(path: string, content: string): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, you would use Deno's file system API
    throw new Error('DenoAdapter.writeFile not implemented');
  },

  async ensureDir(path: string): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, you would use Deno's file system API
    throw new Error('DenoAdapter.ensureDir not implemented');
  },

  getConfigPath(): string {
    // This is a placeholder implementation
    // In a real implementation, you would use Deno's path API
    return '~/.envase/config.json';
  },

  getRuntime(): Runtime {
    return 'deno';
  }
};
