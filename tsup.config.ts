import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false, // Keep false for better debugging
  external: ['axios', 'zod'],
  treeshake: true,
  onSuccess: 'echo "✅ Build completed successfully"',
});
