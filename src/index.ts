// Main SDK exports
export { EnvaseClient } from './client';
export { ApiClient } from './client/api-client';
export { AuthManager } from './client/auth-manager';

// Modules
export { ProjectsModule } from './modules/projects';
export { EnvironmentsModule } from './modules/environments';
export { SecretsModule } from './modules/secrets';
export { TeamsModule } from './modules/teams';

// Utilities
export { EncryptionService } from './utils/encryption';
export { ConfigManager } from './utils/config';
export { FileUtils } from './utils/file-utils';

// Types
export type {
  EnvaseConfig,
  EnvaseClientOptions,
  ApiResponse,
  PaginatedResponse,
} from './types';

export type {
  Project,
  CreateProject,
  UpdateProject,
  ListProjectsParams,
} from './types/projects';

export type {
  Environment,
  CreateEnvironment,
  UpdateEnvironment,
  ListEnvironmentsParams,
} from './types/environments';

export type {
  Secret,
  CreateSecret,
  UpdateSecret,
  ListSecretsParams,
  GetSecretParams,
  SetSecretParams,
} from './types/secrets';

export type {
  TeamMember,
  InviteMember,
  UpdateMemberRole,
  ListMembersParams,
} from './types/teams';

// Errors
export {
  EnvaseError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NetworkError,
} from './types/errors';

// Adapters
export { NodeAdapter } from './adapters/node';
export { BunAdapter } from './adapters/bun';
export { DenoAdapter } from './adapters/deno';
export { BrowserAdapter } from './adapters/browser';
