const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Web font optimization to prevent fontfaceobserver timeout errors
if (process.env.EXPO_PLATFORM === 'web') {
  // Configure web-specific optimizations
  config.resolver.platforms = ['web', 'native', 'ios', 'android'];
  
  // Add font loading optimization
  config.transformer.webOutput = {
    ...config.transformer.webOutput,
    fontDisplay: 'swap', // Use font-display: swap to prevent font loading timeouts
  };
}

module.exports = config; 