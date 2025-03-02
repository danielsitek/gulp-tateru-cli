import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '**/lib/**', '**/example/**'],
    coverage: {
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        '**/test/**',
        '**/lib/**',
        '**/example/**',
      ],
    },
  },
});
