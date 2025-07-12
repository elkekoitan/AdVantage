export default {
  expo: {
    name: 'AdVantage',
    slug: 'advantage',
    version: '1.0.0',
    orientation: 'portrait',

    userInterfaceStyle: 'light',

    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.advantage.app',

    },
    android: {
      package: 'com.advantage.app',

      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-location',
      'expo-image-picker',
      'expo-secure-store',
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
            kotlinVersion: '1.8.10',
            jvmTarget: '17',
            jvmArgs: ['-Xmx1024m', '-XX:MaxMetaspaceSize=512m']
          },
          ios: {
            deploymentTarget: '15.1',
          },
        },
      ],
    ],
    scheme: 'advantage',
    extra: {
      eas: {
        projectId: "05601bff-db0b-43f2-88e0-81c167cd9032"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      geminiApiKey: process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY,
    },
  },
};