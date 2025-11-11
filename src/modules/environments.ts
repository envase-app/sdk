import type { ApiClient } from '../client/api-client';
import type {
  CreateEnvironment,
  Environment,
  ListEnvironmentsParams,
  UpdateEnvironment,
} from '../types/environments';
import type { ApiResponse } from '../types';
import { EnvaseError } from '../types/errors';

export class EnvironmentsModule {
  constructor(private apiClient: ApiClient) {}

  async list(params: ListEnvironmentsParams): Promise<Environment[]> {
    const response = await this.apiClient.get<ApiResponse<Environment[]>>('/api/environments', { 
      params: { projectId: params.projectId } 
    });
    return response.data.data ?? [];
  }

  async get(id: string): Promise<Environment> {
    const response = await this.apiClient.get<ApiResponse<Environment>>(`/api/environments/${id}`);
    const environment = response.data.data;
    if (!environment) {
      throw new EnvaseError(`Environment ${id} not found`, 'ENVIRONMENT_NOT_FOUND');
    }
    return environment;
  }

  async create(projectId: string, data: CreateEnvironment): Promise<Environment> {
    const response = await this.apiClient.post<ApiResponse<Environment>>('/api/environments', data, {
      params: { projectId }
    });
    const environment = response.data.data;
    if (!environment) {
      throw new EnvaseError('Failed to create environment', 'ENVIRONMENT_CREATE_FAILED');
    }
    return environment;
  }

  async update(id: string, data: UpdateEnvironment): Promise<Environment> {
    const response = await this.apiClient.put<ApiResponse<Environment>>(`/api/environments/${id}`, data);
    const environment = response.data.data;
    if (!environment) {
      throw new EnvaseError('Failed to update environment', 'ENVIRONMENT_UPDATE_FAILED');
    }
    return environment;
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/api/environments/${id}`);
  }
}
