# Envase SDK Overview

## What You Get
- Multi-runtime SDK that targets Node.js, Bun, Deno, and browser environments.
- Typed modules for projects, environments, secrets, and teams.
- Configurable API client with retries, timeouts, custom logging, and automatic token refresh.
- AES-256-GCM encryption helper and runtime-aware file utilities.
- Shipping configuration, linting, tests, and CI/CD templates for npm publishing.

## Prerequisites
- Node.js 18 or later (required for development and builds).
- npm for dependency management (scripts also work with pnpm or yarn).
- Access to the Envase API and organization slug to exercise the client.

## Project Structure
- `src/client` – Core API client (`ApiClient`, `AuthManager`, `EnvaseClient`).
- `src/modules` – Domain modules (projects, environments, secrets, teams).
- `src/adapters` – Runtime-specific file-system abstractions.
- `src/utils` – Configuration manager, encryption helper, and file utilities.
- `src/types` – Shared interfaces, Zod schemas, and error hierarchy.
- `tests` – Vitest unit tests.
- `.github/workflows` – CI (`ci.yml`) and npm release automation (`publish.yml`).

## Core Concepts
- **EnvaseClient** wires the API client, auth manager, encryption, and modules into a single façade.
- **ApiClient** wraps Axios with retry logic, optional auto-refresh callbacks, and organization headers.
- **AuthManager** verifies tokens, refreshes them, and propagates updates to the client.
- **EncryptionService** exposes AES-256-GCM helpers compatible across runtimes.
- **FileUtils** auto-detects the current runtime and delegates to the right adapter; it can be overridden for tests.

## Development Workflow
- Install dependencies: `npm install`
- Lint (Biome): `npm run lint`
- Type check: `npm run type-check`
- Tests (Vitest): `npm run test`
- Build (tsup): `npm run build`

## Publishing Workflow
- Create a GitHub Release (e.g. `v1.0.0`).
- Ensure `NPM_TOKEN` is set in GitHub Actions secrets.
- The `publish` workflow builds the package and runs `npm publish --access public`.
- For manual publishing, run `npm run build && npm publish --access public`.

## Useful Exports
- `EnvaseClient`, `ApiClient`, `AuthManager`
- `ProjectsModule`, `EnvironmentsModule`, `SecretsModule`, `TeamsModule`
- `EncryptionService`, `FileUtils`, runtime adapters
- Error classes: `EnvaseError`, `AuthenticationError`, `AuthorizationError`, `ValidationError`, `NetworkError`

For usage details refer to the module-specific guides in this `docs/` folder.

