export default {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }]
  ],
  plugins: [
    "@babel/plugin-syntax-import-assertions",
    "@babel/plugin-syntax-top-level-await"
  ]
};


