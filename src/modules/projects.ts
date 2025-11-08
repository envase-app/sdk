import { ApiClient } from '../client/api-client';
import { Project, CreateProject, UpdateProject, ListProjectsParams } from '../types/projects';
import { ApiResponse, PaginatedResponse } from '../types';

export class ProjectsModule {
  constructor(private apiClient: ApiClient) {}

  async list(params?: ListProjectsParams): Promise<Project[]> {
    const response = await this.apiClient.get<ApiResponse<Project[]>>('/api/projects', { params });
    return response.data.data || [];
  }

  async get(id: string): Promise<Project> {
    const response = await this.apiClient.get<ApiResponse<Project>>(`/api/projects/${id}`);
    return response.data.data!;
  }

  async create(data: CreateProject): Promise<Project> {
    const response = await this.apiClient.post<ApiResponse<Project>>('/api/projects', data);
    return response.data.data!;
  }

  async update(id: string, data: UpdateProject): Promise<Project> {
    const response = await this.apiClient.put<ApiResponse<Project>>(`/api/projects/${id}`, data);
    return response.data.data!;
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/api/projects/${id}`);
  }
}
