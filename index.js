// @fraziym/tree-sitters root entry.
//
// This file is the main entry for require("@fraziym/tree-sitters").
// For subpath imports like require("@fraziym/tree-sitters/graphql"),
// use the exports field in package.json which maps subpaths to each
// grammar's bindings/node/index.js.
//
// The root exports a lazy map of all grammars. Each one throws until
// prebuilds are built via CI
// (github.com/Akik-Forazi/tree-sitters/.github/workflows/build.yml).
// axodex's parser-loader catches the throw and reports "unavailable"
// — graceful degradation, no crash.
module.exports = {
  get graphql() { return require("./grammars/graphql/bindings/node/index.js"); },
  get lua() { return require("./grammars/lua/bindings/node/index.js"); },
  get sql() { return require("./grammars/sql/bindings/node/index.js"); },
  get toml() { return require("./grammars/toml/bindings/node/index.js"); },
  get yaml() { return require("./grammars/yaml/bindings/node/index.js"); },
};
