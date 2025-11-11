# @envase/sdk

Type-safe client for the Envase platform to manage projects, environments, secrets, and teams from Node.js, Bun, Deno, or modern browsers.

## Highlights

- Multi-runtime adapters with runtime detection (`NodeAdapter`, `BunAdapter`, `DenoAdapter`, `BrowserAdapter`)
- AES-256-GCM encryption built-in via `EncryptionService`
- Axios-based HTTP client with automatic retries and optional token auto-refresh
- Fully typed modules for projects, environments, secrets, and teams powered by Zod schemas
- First-class developer experience: Biome linting, Vitest tests, tsup bundling, CI/CD templates

## Installation

```bash
npm install @envase/sdk
# yarn add @envase/sdk
# pnpm add @envase/sdk
```

Requires Node.js ≥ 18.

## Quick Start

```typescript
import { EnvaseClient } from '@envase/sdk';

const client = new EnvaseClient({
  apiUrl: 'https://api.envase.com',
  token: 'your-api-token',
  organization: 'your-org-slug',
  // enableEncryption: true,
  // encryptionKey: '64-hex-characters-key',
  autoRefresh: true,
  onTokenRefresh: (token) => persistToken(token),
});

const secrets = await client.secrets.list({
  projectId: 'project-uuid',
  environmentId: 'environment-uuid',
});

await client.secrets.set({
  projectId: 'project-uuid',
  environmentId: 'environment-uuid',
  key: 'API_KEY',
  value: 's3cr3t-value',
});
```

## Core Modules

### Projects

```typescript
await client.projects.list({ organization: 'org-slug' });
await client.projects.get('project-uuid');
await client.projects.create({ name: 'My App', organization: 'org-slug' });
await client.projects.update('project-uuid', { description: 'Updated' });
await client.projects.delete('project-uuid');
```

**Note**: Operations like `create`, `update`, and `delete` require appropriate permissions. Unauthorized operations will throw `AuthorizationError`.

### Environments

```typescript
await client.environments.list({ projectId: 'project-uuid' });
await client.environments.create('project-uuid', {
  name: 'Staging',
  slug: 'staging',
  protected: false,
});
await client.environments.update('environment-uuid', { protected: true });
await client.environments.delete('environment-uuid');
```

**Note**: Creating, updating, or deleting environments requires appropriate permissions. Operations will fail with `AuthorizationError` if the token lacks permissions.

### Secrets

```typescript
await client.secrets.list({ projectId: 'project-uuid', environmentId: 'env-uuid' });
await client.secrets.get({ projectId: 'project-uuid', environmentId: 'env-uuid', key: 'API_KEY' });
await client.secrets.set({
  projectId: 'project-uuid',
  environmentId: 'env-uuid',
  key: 'DB_URL',
  value: 'postgres://...',
  description: 'Database connection string',
});
await client.secrets.delete({ projectId: 'project-uuid', environmentId: 'env-uuid', key: 'DB_URL' });
```

**Note**: All operations (create, update, delete) require appropriate permissions in your API token. If the token lacks permissions, the SDK will throw an `AuthorizationError`. See the [Security & Authorization](#security--authorization) section for details.

Secrets are transparently encrypted/decrypted when `enableEncryption` is true and a valid `encryptionKey` (64 hex chars) is provided.

### Teams

```typescript
await client.teams.list({ projectId: 'project-uuid' });
await client.teams.invite('project-uuid', { email: 'user@envase.com', role: 'developer' });
await client.teams.updateRole('project-uuid', 'user-uuid', { role: 'read_only' });
await client.teams.remove('project-uuid', 'user-uuid');
```

**Note**: Team management operations (invite, updateRole, remove) require appropriate permissions. The SDK will throw `AuthorizationError` if the token lacks the necessary permissions.

## Configuration Options

- `apiUrl` *(required)* – Base URL of the Envase API.
- `token` *(required unless using `AuthManager` manually)* – Initial bearer token.
- `organization` – Adds `X-Envase-Organization` header automatically.
- `timeout`, `retries`, `retryDelay` – Network resilience controls.
- `autoRefresh`, `onTokenRefresh`, `refreshToken` – Enable automatic token refresh via `AuthManager`.
- `enableEncryption`, `encryptionKey` – Toggle client-side AES-256-GCM encryption.
- `logger` – Custom logger implementing the `Logger` interface for debug output.

See `docs/overview.md` for a complete breakdown of every option.

## Security & Authorization

### Understanding SDK Capabilities vs. Backend Control

The SDK provides methods for all operations (create, read, update, delete) because it's a complete client for the Envase API. **However, the SDK cannot execute these operations without backend authorization.**

Think of it like this: the SDK is like a remote control with buttons for all TV functions. You can press any button, but the TV (the backend) decides whether that action actually happens based on whether it's powered on, the channel exists, you have the right permissions, etc.

### How Authorization Works

1. **SDK methods exist, but execution is controlled by the backend**: When you call `client.secrets.delete()`, the SDK sends an HTTP DELETE request to the Envase API. The backend then checks:
   - Is the token valid?
   - Does the token have permission to delete secrets in this project/environment?
   - If both are true, the operation succeeds. If not, the backend rejects it.

2. **Token-based permissions**: The API token you provide determines what operations are permitted. Tokens can have different scopes (e.g., read-only, read-write, admin) and be scoped to specific projects or environments. The backend validates these permissions on every request.

3. **Backend enforcement**: The Envase API validates permissions server-side for every request. If a token lacks permissions for an operation, the API returns a `403 Forbidden` response, and the SDK throws an `AuthorizationError`.

4. **Error handling**: The SDK converts `403` responses into `AuthorizationError` exceptions that you can catch and handle:

```typescript
import { AuthorizationError, AuthenticationError } from '@envase/sdk';

// Example: Attempting to delete a secret
// The method exists and can be called, but execution depends on backend permissions
try {
  await client.secrets.delete({
    projectId: 'project-uuid',
    environmentId: 'env-uuid',
    key: 'API_KEY',
  });
  // If we reach here, the backend approved the operation
  console.log('Secret deleted successfully');
} catch (error) {
  if (error instanceof AuthorizationError) {
    // Backend rejected: token doesn't have permission to delete secrets
    // The SDK method was called, but the backend refused to execute it
    console.error('Access denied:', error.message);
  } else if (error instanceof AuthenticationError) {
    // Backend rejected: token is invalid or expired
    console.error('Authentication failed:', error.message);
  }
}
```

**Important**: Just because the SDK has a `delete()` method doesn't mean you can delete anything. The backend always has the final say. If your token only has read permissions, all write/delete operations will fail with `AuthorizationError`, even though the methods are available in the SDK.

### Security Best Practices

- **Use least-privilege tokens**: Create API tokens with only the permissions needed for your use case. For read-only operations, use tokens with read-only scope.
- **Protect your tokens**: Never commit tokens to version control. Use environment variables or secure secret management.
- **Rotate tokens regularly**: Regularly rotate API tokens to limit exposure if a token is compromised.
- **Monitor token usage**: Review token activity logs in the Envase dashboard to detect unauthorized access.
- **Environment-specific tokens**: Use different tokens for different environments (development, staging, production) with appropriate permissions for each.

### Key Takeaway

**The SDK provides methods for all operations, but the backend controls whether those operations actually execute.** The SDK cannot bypass backend authorization. Even if you call `client.secrets.delete()`, the operation will only succeed if:
1. Your token is valid
2. Your token has delete permissions for that project/environment
3. The backend validates and approves the request

All authorization and permission validation happens server-side. The SDK is just a convenient way to communicate with the API.

## Encryption Utilities

```typescript
import { EncryptionService } from '@envase/sdk';

const key = await EncryptionService.generateKey(); // -> 64 hex characters
const crypto = new EncryptionService(key);

const encrypted = await crypto.encrypt('sensitive-value');
const decrypted = await crypto.decrypt(encrypted);
```

Provide the generated key through `EnvaseClient` configuration to transparently encrypt secrets at rest.

## Runtime Adapters

```typescript
import { FileUtils, NodeAdapter, BunAdapter, DenoAdapter, BrowserAdapter } from '@envase/sdk';

FileUtils.setAdapter(NodeAdapter); // default in Node.js
FileUtils.setAdapter(BunAdapter);  // set explicitly when needed
FileUtils.getConfigPath();         // runtime-specific config path
```

Adapters abstract file operations across runtimes. The SDK auto-detects the current runtime, but you can override it for testing or custom behaviours.

## Quality Gates & Tooling

- `npm run lint` – Biome linting (format + static analysis)
- `npm run type-check` – TypeScript strict mode (`tsc --noEmit`)
- `npm run test` – Vitest unit tests
- `npm run build` – tsup bundling (`dist/` + declaration files)

## Continuous Delivery

This repository ships with ready-to-use GitHub Actions workflows:

- `.github/workflows/ci.yml` – runs lint, type-check, tests, and build on pushes/PRs.
- `.github/workflows/publish.yml` – publishes to npm when a GitHub Release is created.

To enable automated publishing, add an `NPM_TOKEN` secret under **Repository Settings → Secrets and variables → Actions**. See `docs/publishing.md` for the full release checklist.

## Documentation

- Overview & architecture: `docs/overview.md`
- Authentication & token lifecycle: `docs/authentication.md`
- Secrets module & encryption: `docs/secrets.md`
- Publishing workflow & release automation: `docs/publishing.md`

## License

MIT
