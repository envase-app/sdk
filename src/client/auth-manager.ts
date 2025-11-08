import { ApiClient } from './api-client';
import { AuthenticationError } from '../types/errors';

export interface AuthConfig {
  apiClient: ApiClient;
  token: string;
  autoRefresh?: boolean;
  onTokenRefresh?: (token: string) => void;
}

export class AuthManager {
  private token: string;
  private refreshTokenValue?: string;
  private onTokenRefresh?: (token: string) => void;
  private apiClient: ApiClient;

  constructor(config: AuthConfig) {
    this.token = config.token;
    this.onTokenRefresh = config.onTokenRefresh;
    this.apiClient = config.apiClient;
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/api/auth/verify');
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(): Promise<string> {
    if (!this.refreshTokenValue) {
      throw new AuthenticationError('No refresh token available');
    }

    try {
      const response = await this.apiClient.post('/api/auth/refresh', {
        refreshToken: this.refreshTokenValue
      });

      this.token = response.data.token;
      if (this.onTokenRefresh) {
        this.onTokenRefresh(this.token);
      }

      return this.token;
    } catch (error) {
      throw new AuthenticationError('Failed to refresh token');
    }
  }

  getToken(): string {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }
}
