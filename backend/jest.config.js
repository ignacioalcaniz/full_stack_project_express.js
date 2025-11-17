export default {
  testEnvironment: "node",
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  globalTeardown: "<rootDir>/tests/teardown.js",

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/config/**"
  ],
  coverageReporters: ["text", "lcov", "html"],

  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  },

  // 👇 Esto le dice a Jest que no ignore jsdom ni parse5 al transformarlos
  transformIgnorePatterns: [
    "node_modules/(?!(isomorphic-dompurify|jsdom|parse5|@react-email)/)"
  ],

  testTimeout: 30000
};


