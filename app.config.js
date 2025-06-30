import 'dotenv/config';

export default {
    expo: {
        name: 'cheaper_plan_frontend',
        slug: 'cheaper_plan_frontend',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'cheaperplan',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        owner: "ltly602634744",
        runtimeVersion: {
            policy: 'appVersion' // 会自动用 version 作为更新的 runtime 匹配条件
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.yinghan.cheaperplan",
            entitlements: {
                'com.apple.developer.push-notifications': true
            },
            infoPlist: {
                NSPushNotificationsUsageDescription: 'We use push notifications to send you reminders.',
            }
        },
        android: {
            package: 'com.ltly602634744.cheaperplan',
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
            permissions: ['NOTIFICATIONS'], // 通知权限
            adaptiveIcon: {
                foregroundImage: './assets/images/adaptive-icon.png',
                backgroundColor: '#ffffff'
            },
            edgeToEdgeEnabled: true,
            runtimeVersion: "1.0.0"
        },
        web: {
            bundler: 'metro',
            output: 'static',
            favicon: './assets/images/favicon.png'
        },
        plugins: [
            '@react-native-firebase/app',
            'expo-router',
            [
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#ffffff'
                }
            ]
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            dbUrl: process.env.SUPABASE_URL,
            dbANONKey: process.env.SUPABASE_ANON_KEY,
            eas: {
                "projectId": "61cc432d-e1b6-4575-96d3-320d93d76bdf"
            }
        },
        updates: {
            "url": "https://u.expo.dev/61cc432d-e1b6-4575-96d3-320d93d76bdf"
        }
    }
};