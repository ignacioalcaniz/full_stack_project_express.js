export default {
  testEnvironment: "node",
  transform: {},
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  globalTeardown: "<rootDir>/tests/teardown.js",
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js", // no queremos cubrir el arranque del server
    "!src/config/**", // opcional, excluir configs
  ],
  coverageReporters: ["text", "lcov", "html"],
};
