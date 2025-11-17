export default {
  testEnvironment: "node",
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,

  transform: {
    "^.+\\.(js|jsx)$": ["babel-jest", { configFile: "./babel.config.js" }]
  },

  moduleFileExtensions: ["js", "jsx"],

  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  globalTeardown: "<rootDir>/tests/teardown.js",

  transformIgnorePatterns: [
    "/node_modules/(?!jsdom|isomorphic-dompurify)/"
  ],

  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/config/**"],
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 30000
};











