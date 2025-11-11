# Publishing Guide for @envase/sdk

For the detailed release procedure consult `docs/publishing.md`. The checklist below summarises the essential steps for maintainers:

1. **Prepare**
   - Update `package.json`/`package-lock.json` with `npm version <patch|minor|major>`.
   - Run the quality gates locally: `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`.

2. **Push & Tag**
   ```bash
   git push origin main --tags
   ```

3. **Create GitHub Release**
   ```bash
   gh release create vX.Y.Z --title "vX.Y.Z" --notes "Summary of changes"
   ```

4. **Automation**
   - Ensure the repository has the `NPM_TOKEN` secret configured.
   - The `.github/workflows/publish.yml` workflow builds and executes `npm publish --access public`.

5. **Verify**
   - Monitor GitHub Actions logs for the publish job.
   - Confirm the new version is visible on the npm registry.

### Manual fallback (only if automation is unavailable)
```bash
npm install
npm run build
npm publish --access public
```

Always create a GitHub Release even after a manual publish to keep changelog and automation in sync. For additional context and troubleshooting tips refer to `docs/publishing.md`.

