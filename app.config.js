import 'dotenv/config';

export default {
  expo: {
    name: 'cheaper_plan_frontend',
    slug: 'cheaper_plan_frontend',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/cheaper_plan_icon.png',
    scheme: 'cheaperplan',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    owner: 'ltly602634744',
    runtimeVersion: {
      policy: 'appVersion', // 会自动用 version 作为更新的 runtime 匹配条件
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.yinghan.cheaperplan',
      associatedDomains: [
        'applinks:cheaperplan.net',
        'applinks:www.cheaperplan.net'
      ],
      entitlements: {
        'aps-environment': 'development'
      },
      infoPlist: {
        NSPushNotificationsUsageDescription: 'We use push notifications to send you reminders.',
        ITSAppUsesNonExemptEncryption: false
      },
    },
    android: {
      package: 'com.ltly602634744.cheaperplan',
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      permissions: ['NOTIFICATIONS'], // 通知权限
      adaptiveIcon: {
        foregroundImage: './assets/images/android_adaptive_icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            { scheme: 'https', host: 'cheaperplan.net', pathPrefix: '/reset-password' },
            { scheme: 'https', host: 'www.cheaperplan.net', pathPrefix: '/reset-password' }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        }
      ]
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.ico',
    },
    plugins: [
      'expo-notifications',
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash_icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      dbUrl: process.env.SUPABASE_URL,
      dbANONKey: process.env.SUPABASE_ANON_KEY,
      rc_api_key_ios: process.env.RC_API_KEY_IOS,
      rc_api_key_android: process.env.RC_API_KEY_ANDROID,
      eas: {
        projectId: '61cc432d-e1b6-4575-96d3-320d93d76bdf',
      },
    },
    updates: {
      url: 'https://u.expo.dev/61cc432d-e1b6-4575-96d3-320d93d76bdf',
    },
  },
};
