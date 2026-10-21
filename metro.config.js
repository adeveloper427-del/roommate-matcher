const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @supabase/supabase-js ships an ESM (.mjs) entry point that Metro doesn't
// resolve by default — add it to sourceExts so the package can be bundled.
config.resolver.sourceExts.push('mjs');

module.exports = config;
