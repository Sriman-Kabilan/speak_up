const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Simple optimization
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;