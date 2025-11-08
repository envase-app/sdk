import { ApiClient } from '../client/api-client';
import { Environment, CreateEnvironment, UpdateEnvironment, ListEnvironmentsParams } from '../types/environments';
import { ApiResponse, PaginatedResponse } from '../types';

export class EnvironmentsModule {
  constructor(private apiClient: ApiClient) {}

  async list(params: ListEnvironmentsParams): Promise<Environment[]> {
    const response = await this.apiClient.get<ApiResponse<Environment[]>>('/api/environments', { 
      params: { projectId: params.projectId } 
    });
    return response.data.data || [];
  }

  async get(id: string): Promise<Environment> {
    const response = await this.apiClient.get<ApiResponse<Environment>>(`/api/environments/${id}`);
    return response.data.data!;
  }

  async create(projectId: string, data: CreateEnvironment): Promise<Environment> {
    const response = await this.apiClient.post<ApiResponse<Environment>>('/api/environments', data, {
      params: { projectId }
    });
    return response.data.data!;
  }

  async update(id: string, data: UpdateEnvironment): Promise<Environment> {
    const response = await this.apiClient.put<ApiResponse<Environment>>(`/api/environments/${id}`, data);
    return response.data.data!;
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/api/environments/${id}`);
  }
}
