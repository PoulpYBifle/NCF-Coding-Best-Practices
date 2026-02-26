export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "refactor", "chore", "test", "docs", "style", "perf"]],
    "scope-empty": [1, "never"],
    "subject-max-length": [2, "always", 72],
  },
};
