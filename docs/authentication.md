# Authentication Guide

## AuthManager
`AuthManager` encapsulates token lifecycle management for the Envase API. It is automatically instantiated by `EnvaseClient`, but you can also interact with it directly for advanced flows.

### Configuration Options
Pass these through `EnvaseClient` (or the `AuthManager` constructor when wiring manually):
- `token` – Current bearer token.
- `refreshToken` – Refresh token; required when `autoRefresh` is enabled.
- `autoRefresh` – When `true`, failed requests that throw `AuthenticationError` trigger a refresh.
- `onTokenRefresh(newToken)` – Callback invoked whenever a new token is issued; persist it here.

### Manual Usage
```typescript
const { auth } = client;

const isValid = await auth.verifyToken();
if (!isValid) {
  // optionally trigger re-authentication
}

auth.setToken('new-access-token');
auth.setRefreshToken('new-refresh-token');
```

### Automatic Refresh Flow
1. Configure `autoRefresh: true` and provide both `token` and `refreshToken` to `EnvaseClient`.
2. When the API returns `401`, `ApiClient` calls `auth.refreshToken()`.
3. `AuthManager` hits `/api/auth/refresh`, updates the token, executes `onTokenRefresh`, and retries the original request.
4. If refresh fails, an `AuthenticationError` bubbles up to the caller.

### Refresh Endpoint Contract
The refresh endpoint must return:
```json
{
  "data": {
    "token": "<new access token>",
    "refreshToken": "<optional refresh token>"
  }
}
```
The SDK automatically updates `ApiClient` headers and stored tokens with the returned values.

### Tips
- Call `auth.verifyToken()` during bootstrap to guard protected routes in dashboards or CLIs.
- Use a secure storage mechanism (OS keychain, secrets manager, encrypted cookie) inside `onTokenRefresh`.
- When running in serverless environments, persist updated tokens between invocations to avoid a refresh storm.

