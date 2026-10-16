import { test } from "node:test";
import * as assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GRAMMARS_DIR = path.join(ROOT, "grammars");

const EXPECTED = ["graphql", "lua", "sql", "toml", "yaml"];

test("each expected grammar directory exists", () => {
  for (const g of EXPECTED) {
    const gdir = path.join(GRAMMARS_DIR, g);
    assert.ok(existsSync(gdir), `${g} grammar dir missing`);
    assert.ok(statSync(gdir).isDirectory(), `${g} is not a directory`);
  }
});

test("each grammar has binding.gyp + src/parser.c + sub-package.json", () => {
  for (const g of EXPECTED) {
    const gdir = path.join(GRAMMARS_DIR, g);
    assert.ok(existsSync(path.join(gdir, "binding.gyp")), `${g}: binding.gyp missing`);
    assert.ok(existsSync(path.join(gdir, "src", "parser.c")), `${g}: src/parser.c missing`);
    assert.ok(existsSync(path.join(gdir, "package.json")), `${g}: package.json missing`);
  }
});

test("each grammar sub-package.json has name=tree-sitter-<name> + install=node-gyp-build", () => {
  for (const g of EXPECTED) {
    const pkg = JSON.parse(readFileSync(path.join(GRAMMARS_DIR, g, "package.json"), "utf-8"));
    assert.equal(pkg.name, `tree-sitter-${g}`, `${g}: wrong name`);
    assert.equal(pkg.scripts?.install, "node-gyp-build", `${g}: install script wrong`);
  }
});

test("grammars/ has no unexpected directories", () => {
  const actual = readdirSync(GRAMMARS_DIR).filter((d) =>
    statSync(path.join(GRAMMARS_DIR, d)).isDirectory(),
  );
  const extra = actual.filter((d) => !EXPECTED.includes(d));
  assert.deepEqual(extra, [], `unexpected grammars: ${extra.join(", ")}`);
});
