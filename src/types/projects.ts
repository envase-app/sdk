import { z } from 'zod';

// Project schema
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string().uuid(),
  slug: z.string().min(1),
  archivedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Create project schema
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  organization: z.string().min(1, 'Organization is required'),
});

export type CreateProject = z.infer<typeof CreateProjectSchema>;

// Update project schema
export const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export type UpdateProject = z.infer<typeof UpdateProjectSchema>;

// List projects params
export interface ListProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  organization?: string;
  archived?: boolean;
}

// Project statistics
export interface ProjectStats {
  id: string;
  name: string;
  environmentCount: number;
  secretCount: number;
  memberCount: number;
  lastActivity: string;
}
