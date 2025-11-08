import { z } from 'zod';

// Team member schema
export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['owner', 'developer', 'read_only']),
  status: z.enum(['active', 'pending', 'inactive']),
  invitedBy: z.string().uuid().optional(),
  invitedAt: z.string().datetime().optional(),
  joinedAt: z.string().datetime().optional(),
  lastActiveAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

// Invite member schema
export const InviteMemberSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['developer', 'read_only'], {
    errorMap: () => ({ message: 'Role must be developer or read_only' }),
  }),
  message: z.string().optional(),
});

export type InviteMember = z.infer<typeof InviteMemberSchema>;

// Update member role schema
export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['owner', 'developer', 'read_only']),
});

export type UpdateMemberRole = z.infer<typeof UpdateMemberRoleSchema>;

// List members params
export interface ListMembersParams {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  role?: 'owner' | 'developer' | 'read_only';
  status?: 'active' | 'pending' | 'inactive';
}

// Team invitation
export interface TeamInvitation {
  id: string;
  projectId: string;
  email: string;
  role: string;
  message?: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
}

// Team statistics
export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  owners: number;
  developers: number;
  readOnly: number;
}
