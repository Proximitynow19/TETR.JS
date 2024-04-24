const config = {
  branches: ["stable", { name: "nightly", channel: "beta" }],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github",
    "@semantic-release/npm",
  ],
};

module.exports = config;
