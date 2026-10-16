/**
 * @fraziym/tree-sitters root entry.
 *
 * This file is loaded when a consumer does `require('tree-sitter-<name>')`
 * and the consumer's npm `overrides` redirected that name at this repo via
 * a `github:` URL (e.g. "tree-sitter-graphql": "github:Akik-Forazi/tree-sitters#main").
 *
 * npm's `github:` URL override installs the WHOLE root package under the
 * overridden name — there's no subdirectory support in the override
 * syntax. So this root entry is what gets loaded for all 5 names.
 *
 * We throw with a clear message. axodex's parser-loader catches the
 * throw and reports the grammar as "unavailable" — graceful degradation,
 * no crash.
 *
 * The PROPER fix (once npm publish is set up via the tree-sitters repo's
 * CI workflow) is to switch the consumer's overrides from:
 *   "tree-sitter-graphql": "github:Akik-Forazi/tree-sitters#main"
 * to:
 *   "tree-sitter-graphql": "npm:@fraziym/tree-sitter-graphql@^0.1.0"
 *
 * Each grammar sub-package (grammars/<name>/) is published as a separate
 * npm package via workspaces — see .github/workflows/build.yml.
 */
const GRAMMARS = ["graphql", "lua", "sql", "toml", "yaml"];

module.exports = function unavailableTreeSitterGrammar() {
  throw new Error(
    "@fraziym/tree-sitters root package was loaded directly. " +
    "This usually means a consumer's npm `overrides` redirected a " +
    "tree-sitter-* package at this repo via a `github:` URL — " +
    "npm's override syntax doesn't support subdirectories, so the " +
    "whole root package gets installed under the overridden name. " +
    "\n\n" +
    "To get real grammar parsing, either:\n" +
    "  1. Publish @fraziym/tree-sitter-<name> sub-packages to npm via " +
    "the tree-sitters repo's CI workflow (.github/workflows/build.yml), " +
    "then switch the override to:\n" +
    '    "tree-sitter-<name>": "npm:@fraziym/tree-sitter-<name>@^0.1.0"\n' +
    "  2. OR build prebuilds locally in the tree-sitters repo " +
    "(npm run build) and install via file: path.\n\n" +
    `Available grammars in this repo: ${GRAMMARS.join(", ")}`
  );
};
