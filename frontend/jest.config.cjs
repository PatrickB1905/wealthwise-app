/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  clearMocks: true,
  restoreMocks: true,

  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  setupFiles: ['<rootDir>/src/test/jestEnvSetup.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/styleMock.ts',
  },

  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/vite-env.d.ts',
    '!<rootDir>/src/main.tsx',
  ],

  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
}