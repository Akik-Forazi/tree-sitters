#!/usr/bin/env node
/**
 * assemble-prebuilds.mjs — after `npm run build` produces
 * grammars/<name>/build/Release/<name>.node files, copy them into the
 * prebuilds/<platform>/<arch>/ tree that node-gyp-build expects.
 *
 * Output layout (matches what node-gyp-build looks for):
 *   prebuilds/<platform>-<arch>/
 *     graphql/
 *       tree_sitter_graphql.node
 *     lua/
 *       tree_sitter_lua.node
 *     sql/
 *       tree_sitter_sql.node
 *     toml/
 *       tree_sitter_toml.node
 *     yaml/
 *       tree_sitter_yaml.node
 *
 * node-gyp-build resolves the right subdirectory at runtime via
 * process.platform + process.arch.
 */
import { mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GRAMMARS_DIR = path.join(ROOT, "grammars");
const PREBUILDS_DIR = path.join(ROOT, "prebuilds");

const args = process.argv.slice(2);
const platformArg = args.find((a) => a.startsWith("--platform="))?.split("=")[1];
const archArg = args.find((a) => a.startsWith("--arch="))?.split("=")[1];
if (!platformArg || !archArg) {
  console.error("usage: node assemble-prebuilds.mjs --platform=<linux|win32|darwin> --arch=<x64|arm64>");
  process.exit(1);
}
const targetDir = path.join(PREBUILDS_DIR, `${platformArg}-${archArg}`);
mkdirSync(targetDir, { recursive: true });

const grammars = readdirSync(GRAMMARS_DIR).filter((g) => statSync(path.join(GRAMMARS_DIR, g)).isDirectory());
let copied = 0;
let missing = 0;
for (const g of grammars) {
  // Look for the built .node file — node-gyp puts it at
  // grammars/<g>/build/Release/tree_sitter_<g>.node
  // (the file name follows the pattern from binding.gyp's target_name)
  const possibleNames = [
    `tree_sitter_${g}.node`,
    `tree_sitter_${g.replace(/-/g, "_")}.node`,
    `${g}.node`,
  ];
  const releaseDir = path.join(GRAMMARS_DIR, g, "build", "Release");
  let srcFile = null;
  for (const name of possibleNames) {
    const p = path.join(releaseDir, name);
    if (existsSync(p)) { srcFile = p; break; }
  }
  if (!srcFile) {
    // Fallback: pick the first .node file in the Release dir
    if (existsSync(releaseDir)) {
      const nodes = readdirSync(releaseDir).filter((f) => f.endsWith(".node"));
      if (nodes.length > 0) srcFile = path.join(releaseDir, nodes[0]);
    }
  }
  if (!srcFile) {
    console.error(`[assemble-prebuilds] ${g}: no built .node file found`);
    missing++;
    continue;
  }
  const dstFile = path.join(targetDir, g, path.basename(srcFile));
  mkdirSync(path.dirname(dstFile), { recursive: true });
  copyFileSync(srcFile, dstFile);
  console.log(`[assemble-prebuilds] ${g}: ${path.basename(srcFile)} -> ${path.relative(ROOT, dstFile)}`);
  copied++;
}
console.log(`[assemble-prebuilds] done: ${copied} copied, ${missing} missing`);
process.exit(missing === 0 ? 0 : 1);
