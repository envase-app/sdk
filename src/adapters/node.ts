import { Adapter, Runtime } from '../types';

export const NodeAdapter: Adapter = {
  async readFile(path: string): Promise<string> {
    // This is a placeholder implementation
    // In a real implementation, you would use Node.js fs module
    throw new Error('NodeAdapter.readFile not implemented');
  },

  async writeFile(path: string, content: string): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, you would use Node.js fs module
    throw new Error('NodeAdapter.writeFile not implemented');
  },

  async ensureDir(path: string): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, you would use Node.js fs module
    throw new Error('NodeAdapter.ensureDir not implemented');
  },

  getConfigPath(): string {
    // This is a placeholder implementation
    // In a real implementation, you would use Node.js path module
    return '~/.envase/config.json';
  },

  getRuntime(): Runtime {
    return 'node';
  }
};
