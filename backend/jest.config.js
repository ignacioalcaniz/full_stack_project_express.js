export default {
  testEnvironment: "node",
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  globalTeardown: "<rootDir>/tests/teardown.js",

  // 👇 Cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/config/**"
  ],
  coverageReporters: ["text", "lcov", "html"],

  // 👇 Transformaciones para React Email y JSX
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  },
  testTimeout: 30000,
  transformIgnorePatterns: [
    "node_modules/(?!(\\@react-email)/)" 
  ],
};
