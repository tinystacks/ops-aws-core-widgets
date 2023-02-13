module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['.d.ts', '.js'],
  verbose: true,
  roots: [
    "<rootDir>/test",
    "<rootDir>/src"
  ],
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  coveragePathIgnorePatterns: [],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};