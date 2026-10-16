#!/usr/bin/env bash
# Vendor the 5 broken tree-sitter grammars.
# - graphql: fetched from npm registry (because AXONIZ currently has it stubbed)
# - lua, sql, toml, yaml: copied from AXONIZ's node_modules
#
# Run once from the tree-sitters repo root.
set -euo pipefail

DEST="grammars"
AXONIZ="${1:-/home/z/my-project/AXONIZ}"

# --- graphql (fetch from npm registry) ---
echo "=== vendoring graphql ==="
mkdir -p "$DEST/graphql/src"
TARBALL_DIR=$(mktemp -d)
(cd "$TARBALL_DIR" && npm pack "tree-sitter-graphql@1.0.0" >/dev/null 2>&1)
tar -xzf "$TARBALL_DIR"/tree-sitter-graphql-*.tgz -C "$TARBALL_DIR"
upstream="$TARBALL_DIR/package"
cp "$upstream/binding.gyp"      "$DEST/graphql/binding.gyp"
cp "$upstream/grammar.js"       "$DEST/graphql/grammar.js"
cp "$upstream/src/binding.cc"   "$DEST/graphql/src/binding.cc"
cp "$upstream/src/parser.c"     "$DEST/graphql/src/parser.c"
cp "$upstream/index.js"         "$DEST/graphql/index.js"
cp "$upstream/README.md"        "$DEST/graphql/README.md" 2>/dev/null || true
cp "$upstream/LICENSE"*         "$DEST/graphql/" 2>/dev/null || true
rm -rf "$TARBALL_DIR"

# --- lua, sql, toml, yaml (from AXONIZ node_modules) ---
for g in lua sql toml yaml; do
  src="$AXONIZ/node_modules/tree-sitter-$g"
  dst="$DEST/$g"
  if [ ! -d "$src" ]; then
    echo "ERROR: $src not found (run 'npm install' in $AXONIZ first)"
    exit 1
  fi
  echo "=== vendoring $g ==="
  mkdir -p "$dst/src" "$dst/bindings/node"
  cp "$src/binding.gyp"              "$dst/binding.gyp"
  cp "$src/bindings/node/binding.cc" "$dst/bindings/node/binding.cc"
  cp "$src/bindings/node/index.js"   "$dst/bindings/node/index.js" 2>/dev/null || true
  cp -r "$src/src/."                 "$dst/src/"
  cp "$src/grammar.js"               "$dst/grammar.js" 2>/dev/null || true
  cp "$src/LICENSE"*                  "$dst/" 2>/dev/null || true
  cp "$src/README.md"                "$dst/README.md" 2>/dev/null || true
done
echo "done"
