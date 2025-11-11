import { ApiClient } from './api-client';
import { AuthManager } from './auth-manager';
import { ProjectsModule } from '../modules/projects';
import { EnvironmentsModule } from '../modules/environments';
import { SecretsModule } from '../modules/secrets';
import { TeamsModule } from '../modules/teams';
import { EncryptionService } from '../utils/encryption';
import { ConfigurationError } from '../types/errors';
import type { EnvaseClientOptions } from '../types';
import { ConfigManager } from '../utils/config';

export class EnvaseClient {
  public readonly projects: ProjectsModule;
  public readonly environments: EnvironmentsModule;
  public readonly secrets: SecretsModule;
  public readonly teams: TeamsModule;
  public readonly auth: AuthManager;
  public readonly config: ConfigManager;

  private apiClient: ApiClient;
  private encryption?: EncryptionService;

  constructor(options: EnvaseClientOptions) {
    this.config = new ConfigManager(options);

    if (options.enableEncryption) {
      if (!options.encryptionKey) {
        throw new ConfigurationError(
          'Encryption is enabled but no encryptionKey was provided'
        );
      }
      this.encryption = new EncryptionService(options.encryptionKey);
    } else if (options.encryptionKey) {
      this.encryption = new EncryptionService(options.encryptionKey);
    }

    // Initialize API client
    this.apiClient = new ApiClient({
      apiUrl: options.apiUrl,
      token: options.token,
      organization: options.organization,
      timeout: options.timeout,
      retries: options.retries,
      retryDelay: options.retryDelay,
      logger: options.logger,
    });

    // Initialize auth manager
    this.auth = new AuthManager({
      apiClient: this.apiClient,
      token: options.token,
      refreshToken: options.refreshToken,
      autoRefresh: options.autoRefresh,
      onTokenRefresh: options.onTokenRefresh,
    });

    if (options.autoRefresh) {
      this.apiClient.setUnauthorizedHandler(async () => {
        return await this.auth.refreshToken();
      });
    }

    // Initialize modules
    this.projects = new ProjectsModule(this.apiClient);
    this.environments = new EnvironmentsModule(this.apiClient);
    this.secrets = new SecretsModule(this.apiClient, this.encryption);
    this.teams = new TeamsModule(this.apiClient);
  }

  setToken(token: string | undefined, refreshToken?: string): void {
    this.auth.setToken(token);
    if (refreshToken !== undefined) {
      this.auth.setRefreshToken(refreshToken);
    }
    this.config.update({ token });
  }

  setOrganization(organization: string | undefined): void {
    this.apiClient.setOrganization(organization);
    this.config.update({ organization });
  }
}
