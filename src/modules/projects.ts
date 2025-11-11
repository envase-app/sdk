import type { ApiClient } from '../client/api-client';
import type { CreateProject, ListProjectsParams, Project, UpdateProject } from '../types/projects';
import type { ApiResponse } from '../types';
import { EnvaseError } from '../types/errors';

export class ProjectsModule {
  constructor(private apiClient: ApiClient) {}

  async list(params?: ListProjectsParams): Promise<Project[]> {
    const response = await this.apiClient.get<ApiResponse<Project[]>>('/api/projects', { params });
    return response.data.data || [];
  }

  async get(id: string): Promise<Project> {
    const response = await this.apiClient.get<ApiResponse<Project>>(`/api/projects/${id}`);
    const project = response.data.data;
    if (!project) {
      throw new EnvaseError(`Project ${id} not found`, 'PROJECT_NOT_FOUND');
    }
    return project;
  }

  async create(data: CreateProject): Promise<Project> {
    const response = await this.apiClient.post<ApiResponse<Project>>('/api/projects', data);
    const project = response.data.data;
    if (!project) {
      throw new EnvaseError('Failed to create project', 'PROJECT_CREATE_FAILED');
    }
    return project;
  }

  async update(id: string, data: UpdateProject): Promise<Project> {
    const response = await this.apiClient.put<ApiResponse<Project>>(`/api/projects/${id}`, data);
    const project = response.data.data;
    if (!project) {
      throw new EnvaseError('Failed to update project', 'PROJECT_UPDATE_FAILED');
    }
    return project;
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/api/projects/${id}`);
  }
}
