import { ApiClient } from '../client/api-client';
import { TeamMember, InviteMember, UpdateMemberRole, ListMembersParams } from '../types/teams';
import { ApiResponse, PaginatedResponse } from '../types';

export class TeamsModule {
  constructor(private apiClient: ApiClient) {}

  async list(params: ListMembersParams): Promise<TeamMember[]> {
    const response = await this.apiClient.get<PaginatedResponse<TeamMember>>(`/projects/${params.projectId}/members`, { params });
    return response.data.data;
  }

  async get(projectId: string, userId: string): Promise<TeamMember> {
    const response = await this.apiClient.get<ApiResponse<TeamMember>>(`/projects/${projectId}/members/${userId}`);
    return response.data.data!;
  }

  async invite(projectId: string, data: InviteMember): Promise<void> {
    await this.apiClient.post(`/projects/${projectId}/invitations`, data);
  }

  async updateRole(projectId: string, userId: string, data: UpdateMemberRole): Promise<TeamMember> {
    const response = await this.apiClient.put<ApiResponse<TeamMember>>(`/projects/${projectId}/members/${userId}`, data);
    return response.data.data!;
  }

  async remove(projectId: string, userId: string): Promise<void> {
    await this.apiClient.delete(`/projects/${projectId}/members/${userId}`);
  }
}
