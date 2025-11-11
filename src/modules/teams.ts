import type { ApiClient } from '../client/api-client';
import type {
  InviteMember,
  ListMembersParams,
  TeamMember,
  UpdateMemberRole,
} from '../types/teams';
import type { ApiResponse, PaginatedResponse } from '../types';
import { EnvaseError } from '../types/errors';

export class TeamsModule {
  constructor(private apiClient: ApiClient) {}

  async list(params: ListMembersParams): Promise<TeamMember[]> {
    const response = await this.apiClient.get<PaginatedResponse<TeamMember>>(
      `/api/projects/${params.projectId}/members`,
      { params }
    );
    return response.data.data ?? [];
  }

  async get(projectId: string, userId: string): Promise<TeamMember> {
    const response = await this.apiClient.get<ApiResponse<TeamMember>>(
      `/api/projects/${projectId}/members/${userId}`
    );
    const member = response.data.data;
    if (!member) {
      throw new EnvaseError('Team member not found', 'TEAM_MEMBER_NOT_FOUND');
    }
    return member;
  }

  async invite(projectId: string, data: InviteMember): Promise<void> {
    await this.apiClient.post(`/api/projects/${projectId}/invitations`, data);
  }

  async updateRole(
    projectId: string,
    userId: string,
    data: UpdateMemberRole
  ): Promise<TeamMember> {
    const response = await this.apiClient.put<ApiResponse<TeamMember>>(
      `/api/projects/${projectId}/members/${userId}`,
      data
    );
    const member = response.data.data;
    if (!member) {
      throw new EnvaseError('Failed to update member', 'TEAM_MEMBER_UPDATE_FAILED');
    }
    return member;
  }

  async remove(projectId: string, userId: string): Promise<void> {
    await this.apiClient.delete(`/api/projects/${projectId}/members/${userId}`);
  }
}
