import type { EnvaseConfig } from '../types';

export class ConfigManager {
  private config: EnvaseConfig;

  constructor(config: EnvaseConfig) {
    this.config = config;
  }

  get<K extends keyof EnvaseConfig>(key: K): EnvaseConfig[K] {
    return this.config[key];
  }

  set<K extends keyof EnvaseConfig>(key: K, value: EnvaseConfig[K]): void {
    this.config[key] = value;
  }

  getAll(): EnvaseConfig {
    return { ...this.config };
  }

  update(updates: Partial<EnvaseConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
