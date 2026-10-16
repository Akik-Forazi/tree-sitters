// Loads the prebuilt .node binary for the current platform.
// node-gyp-build prefers prebuilds/<platform>/<arch>/tree_sitter_<name>.node
// over source compilation — if a prebuilt binary exists for the current
// platform, NO node-gyp rebuild is triggered at install time.
module.exports = require('node-gyp-build')(__dirname);
