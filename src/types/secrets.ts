import { z } from 'zod';

// Secret schema
export const SecretSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  key: z.string().min(1),
  value: z.string().optional(),
  description: z.string().optional(),
  scope: z.enum(['project', 'environment']),
  environmentId: z.string().uuid().optional(),
  folderId: z.string().uuid().optional(),
  version: z.number().int().positive(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().optional(),
});

export type Secret = z.infer<typeof SecretSchema>;

// Create secret schema
export const CreateSecretSchema = z.object({
  key: z.string().min(1, 'Secret key is required'),
  value: z.string().min(1, 'Secret value is required'),
  description: z.string().optional(),
  scope: z.enum(['project', 'environment']),
  environmentId: z.string().uuid().optional(),
  folderId: z.string().uuid().optional(),
});

export type CreateSecret = z.infer<typeof CreateSecretSchema>;

// Update secret schema
export const UpdateSecretSchema = z.object({
  value: z.string().min(1).optional(),
  description: z.string().optional(),
  folderId: z.string().uuid().optional(),
});

export type UpdateSecret = z.infer<typeof UpdateSecretSchema>;

export type UpdateSecretParams = UpdateSecret & {
  encrypt?: boolean;
};

// List secrets params
export interface ListSecretsParams {
  projectId: string;
  environmentId?: string;
  page?: number;
  limit?: number;
  search?: string;
  scope?: 'project' | 'environment';
  folderId?: string;
}

// Get secret params
export interface GetSecretParams {
  projectId: string;
  environmentId?: string;
  key: string;
}

// Set secret params
export interface SetSecretParams {
  projectId: string;
  environmentId?: string;
  key: string;
  value: string;
  description?: string;
  folderId?: string;
  scope?: 'project' | 'environment';
  encrypt?: boolean;
}

// Secret version
export interface SecretVersion {
  id: string;
  secretId: string;
  version: number;
  createdBy: string;
  comment?: string;
  createdAt: string;
}

// Secret statistics
export interface SecretStats {
  totalSecrets: number;
  projectSecrets: number;
  environmentSecrets: number;
  protectedSecrets: number;
  lastActivity: string;
}
