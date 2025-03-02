import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      '**/lib/**',
      './lib/**',
      '**/example/**',
      './example/**',
    ],
    coverage: {
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        '**/test/**',
        './test/**',
        '**/lib/**',
        './lib/**',
        '**/example/**',
        './example/**',
      ],
    },
  },
});
