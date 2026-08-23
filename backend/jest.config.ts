import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.ts'],
  // Load .env.test before any test runs
  setupFiles: ['<rootDir>/tests/setup.ts'],
  // Run tests serially to avoid DB race conditions between test files
  runInBand: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
};

export default config;
