# Publishing Guide for @envase/sdk

This document contains step-by-step instructions for creating an independent repository and publishing the SDK to npm.

## Pre-requisites

1. npm account with access to the `@envase` scope
2. GitHub account/organization
3. Node.js and pnpm installed

## Step 1: Setup npm Organization

If you haven't already, create an npm organization for `@envase`:

```bash
npm org create envase
```

Add yourself as a member:
```bash
npm team add envase <your-username>
```

## Step 2: Build the Package

From the monorepo root or `packages/sdk/`:

```bash
cd packages/sdk
pnpm build
```

This creates the `dist/` directory with compiled JavaScript and TypeScript definitions.

## Step 3: Create New Repository

### Option A: Using GitHub CLI

```bash
# Navigate outside monorepo
cd ~/path/to/repos

# Create new directory
mkdir envase-sdk
cd envase-sdk

# Initialize git
git init
git branch -M main

# Create repository on GitHub
gh repo create envase/envase-sdk --public --source=. --remote=origin
```

### Option B: Manual GitHub Creation

1. Go to GitHub and create a new repository named `envase-sdk`
2. Initialize locally:
```bash
mkdir envase-sdk
cd envase-sdk
git init
git branch -M main
git remote add origin https://github.com/envase/envase-sdk.git
```

## Step 4: Copy Files to New Repository

Copy the following files from `packages/sdk/` to your new repository:

```bash
# From monorepo root
cp -r packages/sdk/dist ./envase-sdk/
cp packages/sdk/package.json ./envase-sdk/
cp packages/sdk/README.md ./envase-sdk/
cp packages/sdk/LICENSE ./envase-sdk/
cp packages/sdk/.npmignore ./envase-sdk/
cp packages/sdk/tsup.config.ts ./envase-sdk/
cp packages/sdk/tsconfig.json ./envase-sdk/
```

Or copy everything and then remove unnecessary files:

```bash
# From packages/sdk directory
cp -r * ~/path/to/envase-sdk/

# Then remove files that shouldn't be in the public repo
cd ~/path/to/envase-sdk
rm -rf node_modules
rm -rf src  # Only if you don't want source in public repo
```

## Step 5: Add GitHub Files

Create essential GitHub files:

**`.gitignore`**:
```
node_modules/
dist/
coverage/
*.log
.env*
.vscode/
.idea/
*.swp
*~
.DS_Store
Thumbs.db
```

**`.github/workflows/ci.yml`** (see below for content)

**`.github/workflows/publish.yml`** (see below for content)

## Step 6: Initial Commit and Push

```bash
cd ~/path/to/envase-sdk
git add .
git commit -m "Initial commit: Envase SDK v1.0.0"
git push -u origin main
```

## Step 7: Configure npm Authentication

If using GitHub Actions for automated publishing, you'll need an npm token:

1. Go to https://www.npmjs.com/settings/envase/tokens
2. Generate a new token (automation token)
3. Add to GitHub Secrets: Settings → Secrets → New secret
   - Name: `NPM_TOKEN`
   - Value: (your npm token)

## Step 8: Publish to npm

### First Time Publication

```bash
cd ~/path/to/envase-sdk

# Ensure you're logged in
npm login

# Publish with public access (required for scoped packages)
npm publish --access public
```

### Subsequent Publications

Update version in `package.json`:
- Patch: `1.0.1` (bug fixes)
- Minor: `1.1.0` (new features, backward compatible)
- Major: `2.0.0` (breaking changes)

Then publish:
```bash
npm version patch|minor|major  # Updates version and creates git tag
npm publish --access public
```

## GitHub Actions Workflows

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ catch }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Lint
        run: pnpm lint
        
      - name: Type check
        run: pnpm type-check
        
      - name: Build
        run: pnpm build
        
      - name: Test
        run: pnpm test
```

### `.github/workflows/publish.yml`

```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build
        run: pnpm build
        
      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Publishing Workflow

1. Make changes in the new repository
2. Update version in `package.json` following semantic versioning
3. Commit and push changes
4. Create a new GitHub release:
   ```bash
   gh release create v1.0.0 --title "v1.0.0" --notes "Release notes here"
   ```
5. GitHub Action automatically publishes to npm

## Keeping in Sync with Monorepo

If you want to continue developing in the monorepo and sync changes:

1. Make changes in `packages/sdk/` in the monorepo
2. Copy changes to the public repository
3. Commit and release in the struct repository

Or use git subtree:

```bash
# In monorepo
git subtree push --prefix=packages/sdk origin sdk-main
```

## Troubleshooting

### npm publish errors

- **Error: You do not have permission**: Make sure you're a member of the `@envase` organization on npm
- **Error: Package name already exists**: The package may already be published. Check npm registry
- **Error: Invalid package.json**: Validate your `package.json` with `npm pack --dry-run`

### Build errors

- Ensure all dependencies are listed in `package.json`
- Run `pnpm install` before building
- Check `tsconfig.json` and `tsup.config.ts` for correct configuration

## Next Steps

- Set up automated testing
- Configure release notes generation
- Add contributing guidelines
- Set up documentation website (if needed)




