# Envase SDK Examples

This directory contains example applications demonstrating how to use the Envase SDK.

## Prerequisites

1. Node.js 18 or higher
2. An Envase API token
3. (Optional) Project and Environment IDs for testing

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```bash
   ENVASE_API_URL=https://api.envase.com
   ENVASE_TOKEN=your-api-token-here
   ENVASE_ORGANIZATION=your-org-slug
   ENVASE_PROJECT_ID=your-project-uuid  # Optional
   ENVASE_ENVIRONMENT_ID=your-environment-uuid  # Optional
   ENVASE_ENCRYPTION_KEY=your-64-hex-key  # Optional, for encryption examples
   ```

3. Install dependencies (from the project root):
   ```bash
   npm install
   ```

4. Build the SDK (from the project root):
   ```bash
   npm run build
   ```

## Running Examples

### Basic Example

Demonstrates basic SDK usage: listing projects, environments, and secrets.

```bash
# Using tsx (recommended)
npx tsx examples/basic-example.ts

# Or using ts-node
npx ts-node examples/basic-example.ts

# Or using Node.js with compiled output
npm run build
node dist/examples/basic-example.js
```

### Encryption Example

Demonstrates encryption features: key generation, encrypting/decrypting secrets.

```bash
npx tsx examples/encryption-example.ts
```

### Teams Example

Demonstrates team management: listing members, inviting, updating roles.

```bash
npx tsx examples/teams-example.ts
```

## Examples Overview

### `basic-example.ts`

- Initialize the Envase client
- List projects and environments
- List and retrieve secrets
- Error handling (AuthenticationError, AuthorizationError, etc.)

### `encryption-example.ts`

- Generate encryption keys
- Use encryption with secrets
- Transparent encryption/decryption
- Create and retrieve encrypted secrets

### `teams-example.ts`

- List team members
- Get team member details
- Invite team members (commented out)
- Update member roles (commented out)
- Remove team members (commented out)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ENVASE_API_URL` | Yes | The Envase API base URL |
| `ENVASE_TOKEN` | Yes | Your API authentication token |
| `ENVASE_ORGANIZATION` | No | Your organization slug |
| `ENVASE_PROJECT_ID` | No | Project UUID for testing |
| `ENVASE_ENVIRONMENT_ID` | No | Environment UUID for testing |
| `ENVASE_ENCRYPTION_KEY` | No | 64-character hex encryption key |

## Error Handling

All examples include comprehensive error handling for:

- **AuthenticationError**: Invalid or expired token
- **AuthorizationError**: Insufficient permissions
- **ValidationError**: Invalid input data
- **NetworkError**: Network or server errors

## Notes

- Examples use environment variables for configuration
- Write operations (create, update, delete) are commented out in some examples to prevent accidental changes
- Make sure your API token has the necessary permissions for the operations you want to test
- The SDK handles encryption/decryption transparently when encryption is enabled

## Troubleshooting

### "Missing required environment variables"

Make sure you've created a `.env` file with the required variables.

### "Authentication failed"

Check that your `ENVASE_TOKEN` is valid and not expired.

### "Access denied"

Your token doesn't have the necessary permissions. Check your token's scopes in the Envase dashboard.

### "Cannot find module"

Make sure you've built the SDK:
```bash
npm run build
```

Or install `tsx` or `ts-node` to run TypeScript directly:
```bash
npm install -D tsx ts-node
```

