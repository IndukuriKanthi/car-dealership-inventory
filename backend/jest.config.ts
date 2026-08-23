import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  // Run test suites serially to prevent concurrent writes to the shared test DB
  // from causing flaky failures due to cross-suite data leakage.
  maxWorkers: 1,
};

export default config;
