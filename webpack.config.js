const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // React Native modüllerini transpile et
          'react-native',
          '@react-native',
          'react-native-web',
          'react-native-vector-icons',
          'react-native-svg',
          'react-native-reanimated',
          'react-native-gesture-handler',
          'react-native-screens',
          'react-native-safe-area-context',
          'native-base',
          '@expo/vector-icons',
        ],
      },
    },
    argv
  );

  // React Native web için alias ayarları
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native/Libraries/Components/View/ViewStylePropTypes':
      'react-native-web/dist/exports/View/ViewStylePropTypes',
    'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter':
      'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
    'react-native/Libraries/vendor/emitter/EventEmitter':
      'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
    'react-native/Libraries/EventEmitter/NativeEventEmitter':
      'react-native-web/dist/vendor/react-native/NativeEventEmitter',
  };

  // Platform uzantıları
  config.resolve.extensions = [
    '.web.tsx',
    '.web.ts',
    '.web.jsx',
    '.web.js',
    '.tsx',
    '.ts',
    '.jsx',
    '.js',
    '.json',
  ];

  // Fallback ayarları
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    buffer: false,
  };

  return config;
};