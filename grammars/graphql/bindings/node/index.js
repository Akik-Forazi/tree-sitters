// tree-sitter-graphql native loader — N-API, ABI-stable across Node 14..25+.
//
// Resolution order (first match wins):
//   1. grammars/graphql/build/Release|Debug/   — local `npm run build` output
//   2. grammars/graphql/prebuilds/<plat>-<arch>/ — per-grammar prebuildify output
//   3. repo-root prebuilds/<plat>-<arch>/graphql/ — CI assemble-prebuilds.mjs layout
//
// When nothing matches it throws with the list searched; axodex's
// parser-loader catches the throw and reports the grammar as
// "unavailable" — graceful degradation, no crash.
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const GRAMMAR = 'graphql';
const OUTPUT_NAME = 'tree_sitter_graphql.node';

const grammarDir = path.resolve(__dirname, '..', '..');
const repoRoot = path.resolve(grammarDir, '..', '..');
const platArch = `${process.platform}-${process.arch}`;

const dirs = [
  path.join(grammarDir, 'build', 'Release'),
  path.join(grammarDir, 'build', 'Debug'),
  path.join(grammarDir, 'prebuilds', platArch),
  path.join(repoRoot, 'prebuilds', platArch, GRAMMAR),
];

const names = [OUTPUT_NAME, `tree-sitter-${GRAMMAR}.node`, `${GRAMMAR}.node`];

const searched = [];
let loaded = null;
for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    searched.push(`${dir} (absent)`);
    continue;
  }
  for (const name of names) {
    const file = path.join(dir, name);
    searched.push(file);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      loaded = require(file);
      break;
    }
  }
  if (loaded) break;
}

if (!loaded) {
  throw new Error(
    `tree-sitter-${GRAMMAR} native binding not found for ${platArch}. ` +
      `${grammarDir} may not be built. Searched: ${searched.join('; ')}. ` +
      '(axodex reports parsing unavailable.)'
  );
}

// Attach nodeTypeInfo (like tree-sitter-javascript does) for node class init.
try {
  loaded.nodeTypeInfo = require(path.join(grammarDir, 'src', 'node-types.json'));
} catch (_) {}

module.exports = loaded;
