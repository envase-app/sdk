import type {
  GetSecretParams,
  ListSecretsParams,
  Secret,
  SetSecretParams,
  UpdateSecret,
  UpdateSecretParams,
} from '../types/secrets';
import type { ApiResponse } from '../types';
import { EnvaseError } from '../types/errors';
import type { ApiClient } from '../client/api-client';
import type { EncryptionService } from '../utils/encryption';

export class SecretsModule {
  constructor(
    private apiClient: ApiClient,
    private encryption?: EncryptionService
  ) {}

  async list(params: ListSecretsParams): Promise<Secret[]> {
    const response = await this.apiClient.get<ApiResponse<Secret[]>>(
      '/api/secrets',
      {
        params: {
          projectId: params.projectId,
          environmentId: params.environmentId,
          page: params.page,
          limit: params.limit,
          search: params.search,
          scope: params.scope,
          folderId: params.folderId,
        },
      }
    );

    const secrets = response.data.data ?? [];
    return Promise.all(secrets.map((secret) => this.decryptSecret(secret)));
  }

  async get(params: GetSecretParams): Promise<Secret> {
    const response = await this.apiClient.get<ApiResponse<Secret>>(
      `/api/secrets/${encodeURIComponent(params.key)}`,
      {
        params: {
          projectId: params.projectId,
          environmentId: params.environmentId,
        },
      }
    );
    const secret = response.data.data;
    if (!secret) {
      throw new EnvaseError(`Secret ${params.key} not found`, 'SECRET_NOT_FOUND');
    }
    return this.decryptSecret(secret);
  }

  async set(params: SetSecretParams): Promise<Secret> {
    const value =
      params.encrypt ?? true
        ? await this.encryptValue(params.value)
        : params.value;

    const response = await this.apiClient.post<ApiResponse<Secret>>(
      '/api/secrets',
      {
        key: params.key,
        value,
        description: params.description,
        scope: params.scope ?? (params.environmentId ? 'environment' : 'project'),
        environmentId: params.environmentId,
        folderId: params.folderId,
      },
      {
        params: {
          projectId: params.projectId,
        },
      }
    );

    const secret = response.data.data;
    if (!secret) {
      throw new EnvaseError('Failed to create secret', 'SECRET_CREATE_FAILED');
    }
    return this.decryptSecret(secret);
  }

  async update(id: string, data: UpdateSecretParams): Promise<Secret> {
    const { encrypt, ...rest } = data;
    const payload: UpdateSecret = { ...rest };

    if (payload.value !== undefined && (encrypt ?? true)) {
      payload.value = await this.encryptValue(payload.value);
    }

    const response = await this.apiClient.put<ApiResponse<Secret>>(
      `/api/secrets/${encodeURIComponent(id)}`,
      payload
    );
    const secret = response.data.data;
    if (!secret) {
      throw new EnvaseError('Failed to update secret', 'SECRET_UPDATE_FAILED');
    }
    return this.decryptSecret(secret);
  }

  async delete(params: GetSecretParams): Promise<void> {
    await this.apiClient.delete(`/api/secrets/${encodeURIComponent(params.key)}`, {
      params: {
        projectId: params.projectId,
        environmentId: params.environmentId,
      },
    });
  }

  private async decryptSecret(secret: Secret): Promise<Secret> {
    if (!this.encryption || !secret.value) {
      return secret;
    }

    return {
      ...secret,
      value: await this.encryption.decrypt(secret.value),
    };
  }

  private async encryptValue(value: string): Promise<string> {
    if (!this.encryption) {
      return value;
    }
    return await this.encryption.encrypt(value);
  }
}
