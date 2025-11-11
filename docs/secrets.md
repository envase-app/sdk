# Secrets Module

The `SecretsModule` provides CRUD operations for secrets scoped to projects and environments. It also integrates transparently with the `EncryptionService` when encryption is enabled.

## Basic Operations

```typescript
const { secrets } = client;

await secrets.list({
  projectId: 'project-uuid',
  environmentId: 'environment-uuid',
});

await secrets.get({
  projectId: 'project-uuid',
  environmentId: 'environment-uuid',
  key: 'API_KEY',
});

await secrets.set({
  projectId: 'project-uuid',
  environmentId: 'environment-uuid',
  key: 'DB_URL',
  value: 'postgres://...',
  description: 'Database connection string',
});

await secrets.update('secret-id', {
  value: 'rotated-secret',
  encrypt: true, // defaults to true when encryption is available
});

await secrets.delete({
  projectId: 'project-uuid',
  environmentId: 'environment-uuid',
  key: 'DB_URL',
});
```

### Pagination & Filters
`list` accepts pagination and filter fields:
- `page`, `limit`
- `search`
- `scope` (`'project' | 'environment'`)
- `folderId`

### Encryption Behaviour
- When `enableEncryption` is true, `SecretsModule` encrypts `value` before sending it to the API and decrypts responses automatically.
- Override per-request with `encrypt: false` on `set` or `update`.
- Decryption only happens when the secret payload contains a `value` field; metadata is always returned.

### Error Handling
- `AuthenticationError` – Expired or invalid token.
- `AuthorizationError` – Token lacks permissions for the project/environment.
- `ValidationError` – Input validation failed; inspect `error.details`.
- `EnvaseError` – Generic failure (e.g., missing secret).

Wrap your calls in `try/catch` and branch on the exported error classes to produce actionable messages.

## Working with EncryptionService Directly

```typescript
import { EncryptionService } from '@envase/sdk';

const key = await EncryptionService.generateKey();
const crypto = new EncryptionService(key);

const ciphertext = await crypto.encrypt('plain-text');
const plaintext = await crypto.decrypt(ciphertext);
```

Pass the same key to `EnvaseClient` to enable transparent encryption for all secret operations.

## Security & Permissions

### Understanding Method Availability vs. Execution Control

**The SDK provides methods for all operations (create, read, update, delete), but the backend controls whether those operations actually execute.**

When you call a method like `secrets.delete()`, the SDK sends an HTTP request to the Envase API. The backend then validates:
- Is the token valid?
- Does the token have the required permissions?
- Only if both checks pass does the operation succeed.

The SDK cannot bypass backend authorization. Even if you call `secrets.delete()`, it will only work if your token has delete permissions.

### Permission Requirements

- **Read operations** (`list`, `get`): Require read permissions for the project/environment.
- **Write operations** (`set`, `update`): Require write permissions for the project/environment.
- **Delete operations** (`delete`): Require delete permissions for the project/environment.

### Authorization Errors

If your API token lacks the necessary permissions, the SDK will throw an `AuthorizationError`:

```typescript
import { AuthorizationError } from '@envase/sdk';

try {
  await secrets.delete({
    projectId: 'project-uuid',
    environmentId: 'env-uuid',
    key: 'API_KEY',
  });
} catch (error) {
  if (error instanceof AuthorizationError) {
    // Token doesn't have permission to delete secrets
    // This is enforced by the Envase API backend
    console.error('Access denied. Check your token permissions.');
  }
}
```

### Best Practices

1. **Use tokens with appropriate scopes**: Create API tokens with only the permissions needed for your use case. Even though the SDK has methods for all operations, use read-only tokens when you only need to read secrets.

2. **Handle AuthorizationError gracefully**: Catch `AuthorizationError` to provide user-friendly error messages, but remember that the backend is the source of truth. The SDK method was called, but the backend refused to execute it.

3. **Never trust client-side availability**: Just because `secrets.delete()` exists in the SDK doesn't mean your token can delete secrets. The backend always validates permissions server-side.

4. **Test with appropriate tokens**: When testing your application, use tokens with the same permissions your production tokens will have. This ensures you catch authorization issues early.

**Key Point**: The SDK provides a complete API client with methods for all operations. However, the backend controls execution. Methods that require permissions will fail with `AuthorizationError` if your token lacks the necessary permissions.

See the main [README.md](../README.md#security--authorization) for more security best practices.
