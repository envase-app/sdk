import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type { Logger } from '../types';
import {
  AuthenticationError,
  AuthorizationError,
  EnvaseError,
  NetworkError,
  ValidationError,
} from '../types/errors';

export interface ApiClientConfig {
  apiUrl: string;
  token?: string;
  organization?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  logger?: Logger;
  onUnauthorized?: () => Promise<string | undefined>;
}

export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly retries: number;
  private readonly retryDelay: number;
  private token?: string;
  private organization?: string;
  private logger?: Logger;
  private onUnauthorized?: () => Promise<string | undefined>;

  constructor(config: ApiClientConfig) {
    this.retries = config.retries ?? 3;
    this.retryDelay = config.retryDelay ?? 1000;
    this.token = config.token;
    this.organization = config.organization;
    this.logger = config.logger;
    this.onUnauthorized = config.onUnauthorized;

    this.client = axios.create({
      baseURL: this.normalizeBaseUrl(config.apiUrl),
      timeout: config.timeout ?? 30000,
    });

    this.setupInterceptors();
  }

  setToken(token: string | undefined): void {
    this.token = token;
  }

  getToken(): string | undefined {
    return this.token;
  }

  setOrganization(organization: string | undefined): void {
    this.organization = organization;
  }

  setUnauthorizedHandler(handler?: () => Promise<string | undefined>): void {
    this.onUnauthorized = handler;
  }

  setLogger(logger: Logger | undefined): void {
    this.logger = logger;
  }

  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(() => this.client.get<T>(url, config), {
      method: 'GET',
      url,
    });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(
      () => this.client.post<T>(url, data, config),
      { method: 'POST', url }
    );
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(
      () => this.client.put<T>(url, data, config),
      { method: 'PUT', url }
    );
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(
      () => this.client.patch<T>(url, data, config),
      { method: 'PATCH', url }
    );
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.requestWithRetry(
      () => this.client.delete<T>(url, config),
      { method: 'DELETE', url }
    );
  }

  getBaseURL(): string {
    return this.client.defaults.baseURL ?? '';
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config) => {
      config.headers = config.headers ?? {};
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      if (this.organization) {
        config.headers['X-Envase-Organization'] = this.organization;
      }
      config.headers['Content-Type'] ??= 'application/json';
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.normalizeError(error))
    );
  }

  private async requestWithRetry<T>(
    request: () => Promise<AxiosResponse<T>>,
    metadata: { method: string; url: string },
    attempt = 0
  ): Promise<AxiosResponse<T>> {
    try {
      this.logger?.debug?.(
        `[Envase SDK] Request ${metadata.method} ${metadata.url} (attempt ${
          attempt + 1
        })`
      );
      const response = await request();
      return response;
    } catch (error) {
      const normalized = error instanceof EnvaseError ? error : this.normalizeError(error);

      if (
        normalized instanceof AuthenticationError &&
        this.onUnauthorized &&
        attempt === 0
      ) {
        try {
          const refreshedToken = await this.onUnauthorized();
          if (refreshedToken) {
            this.setToken(refreshedToken);
          }
          return this.requestWithRetry(request, metadata, attempt + 1);
        } catch (authError) {
          throw authError instanceof EnvaseError
            ? authError
            : this.normalizeError(authError);
        }
      }

      if (
        normalized instanceof NetworkError &&
        this.shouldRetry(normalized, attempt)
      ) {
        await this.delay(attempt);
        return this.requestWithRetry(request, metadata, attempt + 1);
      }

      throw normalized;
    }
  }

  private shouldRetry(error: NetworkError, attempt: number): boolean {
    if (attempt >= this.retries) {
      return false;
    }

    const status = error.statusCode ?? 0;
    return status === 0 || status === 429 || status >= 500;
  }

  private async delay(attempt: number): Promise<void> {
    const delay = this.retryDelay * 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private normalizeError(error: unknown): EnvaseError {
    if (error instanceof EnvaseError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      return this.mapAxiosError(error);
    }

    if (error instanceof Error) {
      return new NetworkError(error.message, 0);
    }

    return new NetworkError('Unknown network error', 0);
  }

  private mapAxiosError(error: AxiosError): EnvaseError {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as
      | {
          message?: string;
          details?: { field: string; message: string; code: string }[];
          code?: string;
        }
      | undefined;

    const message = data?.message ?? error.message ?? 'Request failed';

    switch (status) {
      case 401:
        return new AuthenticationError(message, data?.code);
      case 403:
        return new AuthorizationError(message, data?.code);
      case 422:
        return new ValidationError(message, data?.details ?? []);
      default:
        return new NetworkError(message, status);
    }
  }

  private normalizeBaseUrl(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
}
