// Core types
export interface EnvaseConfig {
  // API Configuration
  apiUrl: string;
  token: string;
  organization: string;
  
  // Client Configuration
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  
  // Security Configuration
  encryptionKey?: string;
  enableEncryption?: boolean;
  
  // Cache Configuration
  cacheEnabled?: boolean;
  cacheTtl?: number;
  
  // Logging Configuration
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  logger?: Logger;
}

export interface EnvaseClientOptions extends EnvaseConfig {
  // Additional client options
  autoRefresh?: boolean;
  onTokenRefresh?: (token: string) => void;
  refreshToken?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  requires?: ('mfa' | 'jit')[];
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Logger interface
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

// Runtime detection
export type Runtime = 'node' | 'bun' | 'deno' | 'browser' | 'unknown';

// Adapter interface
export interface Adapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  ensureDir(path: string): Promise<void>;
  getConfigPath(): string;
  getRuntime(): Runtime;
}
