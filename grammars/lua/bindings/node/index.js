// tree-sitter-lua stub loader.
//
// This file is loaded when a consumer does require('tree-sitter-lua').
// We throw with a clear message — axodex's parser-loader catches the
// throw and reports the grammar as 'unavailable'.
//
// Once prebuilds are built via CI (.github/workflows/build.yml), this
// file will be replaced with:
//   module.exports = require('node-gyp-build')(__dirname);
// which loads the prebuilt .node file for the current platform.
module.exports = function unavailableTreeSitterGrammar() {
  throw new Error(
    'tree-sitter-lua is not built. The @fraziym/tree-sitters repo ' +
    'has not yet produced prebuilds for this platform. ' +
    'axodex will report lua parsing as unavailable. ' +
    'See https://github.com/Akik-Forazi/tree-sitters for build instructions.'
  );
};
