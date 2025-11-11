import { AuthenticationError } from '../types/errors';
import type { ApiResponse } from '../types';
import type { ApiClient } from './api-client';

export interface AuthConfig {
  apiClient: ApiClient;
  token?: string;
  refreshToken?: string;
  autoRefresh?: boolean;
  onTokenRefresh?: (token: string) => void;
}

export class AuthManager {
  private token?: string;
  private refreshTokenValue?: string;
  private onTokenRefresh?: (token: string) => void;
  private apiClient: ApiClient;
  private autoRefresh: boolean;

  constructor(config: AuthConfig) {
    this.apiClient = config.apiClient;
    this.autoRefresh = config.autoRefresh ?? false;
    this.onTokenRefresh = config.onTokenRefresh;
    if (config.token) {
      this.setToken(config.token);
    }
    if (config.refreshToken) {
      this.setRefreshToken(config.refreshToken);
    }
  }

  isAutoRefreshEnabled(): boolean {
    return this.autoRefresh;
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.apiClient.get<ApiResponse<{ valid: boolean }>>(
        '/api/auth/verify'
      );
      return Boolean(response.data.data?.valid);
    } catch (error) {
      return false;
    }
  }

  async refreshToken(): Promise<string> {
    if (!this.refreshTokenValue) {
      throw new AuthenticationError('No refresh token available');
    }

    const previousToken = this.apiClient.getToken();

    try {
      this.apiClient.setToken(undefined);

      const response = await this.apiClient.post<
        ApiResponse<{ token: string; refreshToken?: string }>
      >('/api/auth/refresh', {
        refreshToken: this.refreshTokenValue,
      });

      const newToken = response.data.data?.token;
      const nextRefresh = response.data.data?.refreshToken;

      if (!newToken) {
        throw new AuthenticationError('Failed to refresh token');
      }

      this.setToken(newToken);
      if (nextRefresh) {
        this.setRefreshToken(nextRefresh);
      }

      if (this.onTokenRefresh) {
        this.onTokenRefresh(newToken);
      }

      return newToken;
    } catch (error) {
      throw new AuthenticationError('Failed to refresh token');
    } finally {
      if (this.apiClient.getToken() !== this.token) {
        this.apiClient.setToken(this.token ?? previousToken);
      }
    }
  }

  getToken(): string | undefined {
    return this.token;
  }

  setToken(token: string | undefined): void {
    this.token = token;
    this.apiClient.setToken(token);
  }

  setRefreshToken(token: string | undefined): void {
    this.refreshTokenValue = token;
  }

  getRefreshToken(): string | undefined {
    return this.refreshTokenValue;
  }
}
