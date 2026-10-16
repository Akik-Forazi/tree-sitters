#!/usr/bin/env node
/**
 * Generate sub-package.json + index.js for each vendored grammar.
 * Each sub-package:
 *   - name = "tree-sitter-<grammar>" (so npm `overrides` can redirect)
 *   - main = "bindings/node/index.js"
 *   - install = "node-gyp-build" (uses prebuilds, no source compilation)
 *
 * node-gyp-build NEVER triggers node-gyp rebuild directly — it loads the
 * prebuilt .node file from prebuilds/<platform>/<arch>/. If no prebuilt
 * exists for the current platform, node-gyp-build falls back to
 * node-gyp rebuild — but we ship prebuilds for linux-x64, win32-x64,
 * darwin-arm64, and darwin-x64 via CI.
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GRAMMARS_DIR = path.join(ROOT, "grammars");

const TEMPLATE = (name) => ({
  name: `tree-sitter-${name}`,
  version: "0.0.0-vendored",
  description: `Vendored copy of tree-sitter-${name} from @fraziym/tree-sitters (prebuilt, no native compilation at install time).`,
  main: "bindings/node/index.js",
  scripts: {
    install: "node-gyp-build",
  },
  dependencies: {
    "node-gyp-build": "^5.0.0",
  },
});

const INDEX_JS = `// Loads the prebuilt .node binary for the current platform.
// node-gyp-build prefers prebuilds/<platform>/<arch>/tree_sitter_<name>.node
// over source compilation — if a prebuilt binary exists for the current
// platform, NO node-gyp rebuild is triggered at install time.
module.exports = require('node-gyp-build')(__dirname);
`;

function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

const grammars = readdirSync(GRAMMARS_DIR).filter((g) => isDir(path.join(GRAMMARS_DIR, g)));
for (const g of grammars) {
  const gdir = path.join(GRAMMARS_DIR, g);
  const bindingsDir = path.join(gdir, "bindings", "node");
  if (!existsSync(bindingsDir)) {
    mkdirSync(bindingsDir, { recursive: true });
  }
  writeFileSync(path.join(bindingsDir, "index.js"), INDEX_JS);
  const pkg = TEMPLATE(g);
  writeFileSync(path.join(gdir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  console.log(`generated ${g}/package.json + bindings/node/index.js`);
}
