export default {
  testEnvironment: 'node',

  // 🔑 dotenv FIRST (before any imports)
  setupFiles: ['<rootDir>/jest.env.js'],

  // 🧪 Prisma, hooks, cleanup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!jest.setup.js',
  ],
  transform: {},
};
