# Publishing to npm

The repository includes automation to build and publish `@envase/sdk` to the npm registry. Follow the checklist below to ship a new version safely.

## Prerequisites
- You are a maintainer of the `@envase` npm scope.
- `NPM_TOKEN` secret is configured in GitHub (`Settings → Secrets and variables → Actions`).
- Local environment uses Node.js 18+ and npm ≥ 9.

## Release Workflow
1. **Update version**
   ```bash
   npm version patch   # or minor / major
   ```
   This updates `package.json` and `package-lock.json` and creates a git tag.

2. **Run quality gates locally**
   ```bash
   npm install
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

3. **Commit and push**
   ```bash
   git push origin main --tags
   ```

4. **Create GitHub Release**
   ```bash
   gh release create v1.0.1 --title "v1.0.1" --notes "Summary of changes"
   ```
   The `publish` workflow triggers automatically, builds the package, and runs `npm publish --access public`.

5. **Verify**
   - Inspect the workflow logs in GitHub Actions.
   - Confirm the new version is visible at https://www.npmjs.com/package/@envase/sdk.

## Manual Publish (fallback)
```bash
npm install
npm run build
npm publish --access public
```

Use this only when automation is unavailable. After a manual publish, still create a GitHub release so the changelog remains complete.

## Continuous Integration
- `.github/workflows/ci.yml` runs on every push/PR to guard lint, type-check, tests, and bundling.
- `.github/workflows/publish.yml` handles npm publication on release creation.

Ensure all quality checks pass before tagging a release; the publish workflow will abort on build or test failures.

