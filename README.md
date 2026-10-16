# @fraziym/tree-sitters

**FRAZIYM-maintained tree-sitter grammar collection with platform prebuilds.**

## Why this exists

The upstream `tree-sitter-*` npm packages fall into two categories:

1. **Well-maintained** (bash, c-sharp, cpp, css, elixir, go, html, java,
   javascript, json, php, python, ruby, rust, scala, typescript) — these
   ship prebuilds for `linux-x64`, `win32-x64`, `darwin-arm64`, and
   `darwin-x64`, so `npm ci` uses the prebuilt binary and never
   triggers `node-gyp rebuild`.

2. **Broken or stale** (graphql@1.0.0, lua@2.1.3, sql@0.1.0,
   toml@0.5.1, yaml@0.5.0) — these have NO prebuilds. npm's auto-rebuild
   behavior for packages with a `binding.gyp` file triggers
   `node-gyp rebuild` at install time, which fails on:
   - **Windows Node 22+ CI runners** — `node-gyp` can't find a
     compatible Visual Studio (the new VS 2025 Enterprise isn't
     recognized by older node-gyp versions bundled with npm).
   - **Node 24+ local installs** — the binding.cc files use the
     Node 12 V8 C++ API which broke in Node 22+.

The `@fraziym/axodex` package depends on all 5 broken packages
(transitively, via its own `tree-sitter-*` dependencies). This breaks
`npm ci` for any project that uses `@fraziym/axodex` (including AXONIZ).

## The fix

`@fraziym/tree-sitters` is a single npm package that vendors the 5
broken grammars and ships prebuilds for all major platforms. The
install script (`node-gyp-build`) prefers prebuilds — if a prebuilt
binary for the current platform exists, it's loaded directly with NO
source compilation.

Consumer projects (AXONIZ, axodex, etc.) use npm `overrides` to
redirect the 5 broken `tree-sitter-*` packages at
`@fraziym/tree-sitters`:

```json
{
  "overrides": {
    "tree-sitter-graphql": "npm:@fraziym/tree-sitters@^0.1.0",
    "tree-sitter-lua": "npm:@fraziym/tree-sitters@^0.1.0",
    "tree-sitter-sql": "npm:@fraziym/tree-sitters@^0.1.0",
    "tree-sitter-toml": "npm:@fraziym/tree-sitters@^0.1.0",
    "tree-sitter-yaml": "npm:@fraziym/tree-sitters@^0.1.0"
  }
}
```

The package exports each grammar by name (`require('@fraziym/tree-sitters/graphql')`,
`require('@fraziym/tree-sitters/lua')`, etc.), and the package is
configured so npm `overrides` resolves `require('tree-sitter-graphql')`
to the right sub-path.

## Adding a new grammar

1. Copy the grammar's upstream source into `grammars/<name>/`:
   - `binding.gyp`
   - `binding.cc` (or `bindings/node/binding.cc`)
   - `src/parser.c` (and `src/scanner.c` / `scanner.cc` if present)
   - `grammar.js` (for reference + future regeneration)
   - `LICENSE` (preserve upstream license)
2. Add an entry to `scripts/build-grammars.mjs`'s `GRAMMARS` array.
3. Add a sub-package `grammars/<name>/package.json` with:
   - `"name": "tree-sitter-<name>"` (so npm overrides can redirect)
   - `"install": "node-gyp-build"` (uses prebuilds)
   - `"main": "index.js"` (loads the prebuilt .node file)
4. Add an `index.js` that loads the prebuilt binary:
   ```js
   module.exports = require('node-gyp-build')(__dirname);
   ```
5. Open a PR — CI will build prebuilds for all platforms.

## Build process

The CI workflow (`.github/workflows/build.yml`) runs on tag push and:

1. Compiles each grammar's `.node` binary on a matrix of
   `{ubuntu, windows, macos}` × `{x64, arm64}` runners.
2. Uploads each platform's `.node` files as workflow artifacts.
3. On the final job, downloads all platform artifacts and assembles
   the `prebuilds/` directory tree.
4. Commits the prebuilds back to the repo (or attaches them to a
   GitHub Release).

Local builds (when developing/testing) use `npm run build` which
runs `node-gyp rebuild` for the current platform only.

## License

MIT for the build scripts + glue code. Each vendored grammar retains
its upstream license (see `grammars/<name>/LICENSE`).

## Maintained by

[AKIK FARAJI](https://fraziym.com) · [github.com/Akik-Forazi/tree-sitters](https://github.com/Akik-Forazi/tree-sitters)
