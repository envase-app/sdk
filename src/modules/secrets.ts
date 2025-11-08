import { ApiClient } from '../client/api-client';
import { Secret, CreateSecret, UpdateSecret, ListSecretsParams, GetSecretParams, SetSecretParams } from '../types/secrets';
import { ApiResponse, PaginatedResponse } from '../types';

export class SecretsModule {
  constructor(private apiClient: ApiClient) {}

  async list(params: ListSecretsParams): Promise<Secret[]> {
    const response = await this.apiClient.get<ApiResponse<Secret[]>>('/api/secrets', { 
      params: { 
        projectId: params.projectId,
        environmentId: params.environmentId 
      } 
    });
    return response.data.data || [];
  }

  async get(params: GetSecretParams): Promise<Secret> {
    const response = await this.apiClient.get<ApiResponse<Secret>>(`/api/secrets/${params.key}`, {
      params: { 
        projectId: params.projectId, 
        environmentId: params.environmentId 
      }
    });
    return response.data.data!;
  }

  async set(params: SetSecretParams): Promise<Secret> {
    const response = await this.apiClient.post<ApiResponse<Secret>>('/api/secrets', {
      key: params.key,
      value: params.value,
      description: params.description,
      scope: params.environmentId ? 'environment' : 'project',
      environmentId: params.environmentId,
      folderId: params.folderId,
    });
    return response.data.data!;
  }

  async update(id: string, data: UpdateSecret): Promise<Secret> {
    const response = await this.apiClient.put<ApiResponse<Secret>>(`/api/secrets/${id}`, data);
    return response.data.data!;
  }

  async delete(params: GetSecretParams): Promise<void> {
    await this.apiClient.delete(`/api/secrets/${params.key}`, {
      params: { 
        projectId: params.projectId, 
        environmentId: params.environmentId 
      }
    });
  }
}
