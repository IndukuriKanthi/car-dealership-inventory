import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
};

export default config;
