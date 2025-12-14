module.exports = {
  env: {
    node: true,     // Node globals like require, process
    es2021: true,
    jest: true,     // For tests
  },
  extends: ["eslint:recommended"],
  rules: {
    // add or override server-specific rules if needed
  },
};
