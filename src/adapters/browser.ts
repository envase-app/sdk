import { Adapter, Runtime } from '../types';

export const BrowserAdapter: Adapter = {
  async readFile(path: string): Promise<string> {
    // This is a placeholder implementation
    // In a real implementation, you would use browser APIs
    throw new Error('BrowserAdapter.readFile not implemented');
  },

  async writeFile(path: string, content: string): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, you would use browser APIs
    throw new Error('BrowserAdapter.writeFile not implemented');
  },

  async ensureDir(path: string): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, you would use browser APIs
    throw new Error('BrowserAdapter.ensureDir not implemented');
  },

  getConfigPath(): string {
    // This is a placeholder implementation
    // In a real implementation, you would use browser storage
    return 'browser-storage';
  },

  getRuntime(): Runtime {
    return 'browser';
  }
};
