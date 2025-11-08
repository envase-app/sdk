import { EnvaseClientOptions } from '../types';
import { ApiClient } from './api-client';
import { AuthManager } from './auth-manager';
import { ProjectsModule } from '../modules/projects';
import { EnvironmentsModule } from '../modules/environments';
import { SecretsModule } from '../modules/secrets';
import { TeamsModule } from '../modules/teams';

export class EnvaseClient {
  public readonly projects: ProjectsModule;
  public readonly environments: EnvironmentsModule;
  public readonly secrets: SecretsModule;
  public readonly teams: TeamsModule;
  public readonly auth: AuthManager;

  private apiClient: ApiClient;

  constructor(options: EnvaseClientOptions) {
    // Initialize API client
    this.apiClient = new ApiClient({
      apiUrl: options.apiUrl,
      token: options.token,
      timeout: options.timeout,
      retries: options.retries,
      retryDelay: options.retryDelay,
    });

    // Initialize auth manager
    this.auth = new AuthManager({
      apiClient: this.apiClient,
      token: options.token,
      autoRefresh: options.autoRefresh,
      onTokenRefresh: options.onTokenRefresh,
    });

    // Initialize modules
    this.projects = new ProjectsModule(this.apiClient);
    this.environments = new EnvironmentsModule(this.apiClient);
    this.secrets = new SecretsModule(this.apiClient);
    this.teams = new TeamsModule(this.apiClient);
  }
}
