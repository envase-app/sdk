import { z } from 'zod';

// Environment schema
export const EnvironmentSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  protected: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

// Create environment schema
export const CreateEnvironmentSchema = z.object({
  name: z.string().min(1, 'Environment name is required'),
  slug: z.string().min(1, 'Environment slug is required'),
  protected: z.boolean().default(false),
});

export type CreateEnvironment = z.infer<typeof CreateEnvironmentSchema>;

// Update environment schema
export const UpdateEnvironmentSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  protected: z.boolean().optional(),
});

export type UpdateEnvironment = z.infer<typeof UpdateEnvironmentSchema>;

// List environments params
export interface ListEnvironmentsParams {
  projectId: string;
  page?: number;
  limit?: number;
  search?: string;
  protected?: boolean;
}

// Environment statistics
export interface EnvironmentStats {
  id: string;
  name: string;
  slug: string;
  protected: boolean;
  secretCount: number;
  lastActivity: string;
}
