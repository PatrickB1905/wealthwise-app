/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  clearMocks: true,
  restoreMocks: true,

  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  setupFiles: ['<rootDir>/src/test/jestEnvSetup.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],

  testMatch: ['<rootDir>/src/**/*.test.ts?(x)'],

  moduleNameMapper: {
    '^@/(.*)\\.js$': '<rootDir>/src/$1',
    '^@app/(.*)\\.js$': '<rootDir>/src/app/$1',
    '^@features/(.*)\\.js$': '<rootDir>/src/features/$1',
    '^@shared/(.*)\\.js$': '<rootDir>/src/shared/$1',
    '^@assets/(.*)\\.js$': '<rootDir>/src/assets/$1',
    '^@test/(.*)\\.js$': '<rootDir>/src/test/$1',

    '^@/(.*)$': '<rootDir>/src/$1',

    '^@shared/ui$': '<rootDir>/src/shared/ui/index.ts',
    '^@shared/ui/(.*)$': '<rootDir>/src/shared/ui/$1',

    '^@shared/theme$': '<rootDir>/src/shared/theme/index.ts',
    '^@shared/theme/(.*)$': '<rootDir>/src/shared/theme/$1',

    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',

    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/styleMock.ts',
    '\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/src/test/fileMock.ts',
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