# @envase/sdk

TypeScript SDK for Envase API - Environment variables management made easy.

## Features

- 🚀 **Multi-runtime support**: Node.js, Bun, Vite, Webpack, Deno
- 🔒 **Built-in encryption**: AES-256-GCM encryption for secrets
- 🔐 **Authentication**: Automatic token management and refresh
- 📦 **Tree-shaking**: Optimized bundle size
- 🎯 **TypeScript**: Full type safety with Zod validation
- ⚡ **Fast**: Optimized for performance

## Installation

```bash
npm install @envase/sdk
# or
yarn add @envase/sdk
# or
pnpm add @envase/sdk
```

## Quick Start

```typescript
import { EnvaseClient } from '@envase/sdk';

// Initialize the client
const client = new EnvaseClient({
  apiUrl: 'https://api.envase.com',
  token: 'your-api-token',
  organization: 'your-org-slug'
});

// Pull environment variables
const secrets = await client.secrets.list({
  project: 'my-app',
  environment: 'production'
});

// Set a secret
await client.secrets.set({
  project: 'my-app',
  environment: 'production',
  key: 'API_KEY',
  value: 'secret-value'
});
```

## Usage

### Projects

```typescript
// List projects
const projects = await client.projects.list();

// Get project details
const project = await client.projects.get('project-id');

// Create project
const newProject = await client.projects.create({
  name: 'My App',
  description: 'My awesome app',
  organization: 'my-org'
});
```

### Environments

```typescript
// List environments
const environments = await client.environments.list('project-id');

// Create environment
const env = await client.environments.create('project-id', {
  name: 'staging',
  slug: 'staging',
  protected: false
});
```

### Secrets

```typescript
// List secrets
const secrets = await client.secrets.list({
  project: 'my-app',
  environment: 'production'
});

// Get specific secret
const secret = await client.secrets.get({
  project: 'my-app',
  environment: 'production',
  key: 'API_KEY'
});

// Set secret
await client.secrets.set({
  project: 'my-app',
  environment: 'production',
  key: 'API_KEY',
  value: 'secret-value',
  description: 'API key for external service'
});

// Delete secret
await client.secrets.delete({
  project: 'my-app',
  environment: 'production',
  key: 'API_KEY'
});
```

### Bulk Operations

```typescript
// Sync from file
await client.secrets.syncFromFile({
  project: 'my-app',
  environment: 'production',
  filePath: '.env.production'
});

// Export to file
await client.secrets.exportToFile({
  project: 'my-app',
  environment: 'production',
  filePath: '.env.production'
});

// Sync between environments
await client.secrets.syncBetweenEnvironments({
  project: 'my-app',
  from: 'development',
  to: 'staging',
  keys: ['DATABASE_URL', 'API_KEY']
});
```

## Configuration

### Basic Configuration

```typescript
const client = new EnvaseClient({
  apiUrl: 'https://api.envase.com',
  token: 'your-api-token',
  organization: 'your-org-slug',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000
});
```

### Advanced Configuration

```typescript
const client = new EnvaseClient({
  apiUrl: 'https://api.envase.com',
  token: 'your-api-token',
  organization: 'your-org-slug',
  
  // Security
  enableEncryption: true,
  encryptionKey: 'your-encryption-key',
  
  // Caching
  cacheEnabled: true,
  cacheTtl: 300000, // 5 minutes
  
  // Logging
  logLevel: 'info',
  logger: {
    debug: (msg) => console.debug(msg),
    info: (msg) => console.info(msg),
    warn: (msg) => console.warn(msg),
    error: (msg) => console.error(msg),
  },
  
  // Auto refresh
  autoRefresh: true,
  onTokenRefresh: (newToken) => {
    // Save new token
    saveToken(newToken);
  }
});
```

## Error Handling

```typescript
import { 
  EnvaseError, 
  AuthenticationError, 
  AuthorizationError,
  ValidationError,
  NetworkError 
} from '@envase/sdk';

try {
  const secret = await client.secrets.get({
    project: 'my-app',
    environment: 'production',
    key: 'API_KEY'
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof AuthorizationError) {
    console.error('Access denied:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.details);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.statusCode);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Multi-Runtime Support

### Node.js

```typescript
import { EnvaseClient } from '@envase/sdk';

const client = new EnvaseClient({
  apiUrl: process.env.ENVASE_API_URL,
  token: process.env.ENVASE_TOKEN,
  organization: process.env.ENVASE_ORGANIZATION
});
```

### Bun

```typescript
import { EnvaseClient } from '@envase/sdk';

const client = new EnvaseClient({
  apiUrl: Bun.env.ENVASE_API_URL,
  token: Bun.env.ENVASE_TOKEN,
  organization: Bun.env.ENVASE_ORGANIZATION
});
```

### Vite

```typescript
import { EnvaseClient } from '@envase/sdk';

const client = new EnvaseClient({
  apiUrl: import.meta.env.VITE_ENVASE_API_URL,
  token: import.meta.env.VITE_ENVASE_TOKEN,
  organization: import.meta.env.VITE_ENVASE_ORGANIZATION
});
```

## API Reference

### EnvaseClient

The main client class for interacting with the Envase API.

#### Constructor

```typescript
new EnvaseClient(options: EnvaseClientOptions)
```

#### Methods

- `projects` - Project management
- `environments` - Environment management  
- `secrets` - Secret management
- `teams` - Team management
- `auth` - Authentication utilities

## License

MIT

## Support

- [Documentation](https://envase.com/docs/sdk)
- [GitHub Issues](https://github.com/envase/envase/issues)
- [Discord Community](https://discord.gg/envase)
