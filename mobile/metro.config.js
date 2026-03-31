// metro.config.js — WatermelonDB and shared package support
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch the shared package directory
config.watchFolders = [
  path.resolve(__dirname, '../packages/shared'),
];

// Resolve shared package
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../packages'),
];

module.exports = config;
