import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    env: {
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'test-secret-key',
      PORT: '0',
      CORS_ORIGIN: 'http://localhost:5173',
    },
    globalSetup: ['./tests/global-setup.ts'],
  },
});
