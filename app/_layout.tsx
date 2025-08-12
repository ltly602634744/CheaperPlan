// app/_layout.tsx

import { Href, Stack, useRouter } from 'expo-router';
// 1. 导入你的 AuthProvider
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import React, { useEffect } from 'react';
import { Platform, StatusBar, Text, TextInput, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { supabase } from './services/supabase';
import { setPasswordResetMode } from './services/authService';

// 导入 NativeWind 样式
import '../global.css';

// ------ RevenueCat 公钥（请替换成你项目里的实际值） ------
import Constants from 'expo-constants';

const rc_api_key_ios: string = Constants.expoConfig?.extra?.rc_api_key_ios;
const rc_api_key_android: string = Constants.expoConfig?.extra?.rc_api_key_android;

// -----------------------------------------------------------

// 禁用字体缩放
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

// 设置全局通知处理程序
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // iOS 专用，显示顶部 banner
    shouldShowList: true, // iOS 专用，显示在通知中心列表中
  }),
});

// 你可能还需要一个内部组件来处理重定向，因为它现在可以安全地使用 useAuth 了
function AppLayout() {
  const { session, loading } = useAuthContext();
  const router = useRouter();

  // ① 初始化 RevenueCat Purchases SDK，只执行一次
  useEffect(() => {
    Purchases.configure({
      apiKey: Platform.select({
        ios: rc_api_key_ios,
        android: rc_api_key_android,
      }) as string,
    });
  }, []);

  // 可选：当用户登录 / 登出时绑定 RC 用户
  useEffect(() => {
    if (session?.user?.id) {
      Purchases.logIn(session.user.id).catch(() => {});
    } else {
      Purchases.logOut().catch(() => {});
    }
  }, [session]);

  // ② 通知点击处理（保持原逻辑）
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const route = response?.notification?.request?.content?.data?.route;
        if (route) {
          console.log('Notification tapped while app is running, navigating to:', route);
          router.push(route as Href);
        }
      },
    );

    // 处理杀死态点击通知启动 App
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const route = response?.notification?.request?.content?.data?.route;
        if (route) {
          console.log('App launched by notification, navigating to:', route);
          setTimeout(() => {
            router.push(route as Href);
          }, 100);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  // ③ Deep link处理 - 用于密码重置
  useEffect(() => {
    const createSessionFromUrl = async (url: string) => {
      try {
        // 解析URL参数
        const transformedUrl = url.replace('#', '?');
        const parsedUrl = Linking.parse(transformedUrl);
        
        const access_token = parsedUrl.queryParams?.access_token;
        const refresh_token = parsedUrl.queryParams?.refresh_token;
        const type = parsedUrl.queryParams?.type;
        
        if (typeof access_token === 'string' && typeof refresh_token === 'string') {
          console.log('Creating session from URL tokens');
          
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            throw error;
          }
          
          if (type === 'recovery') {
            console.log('Recovery session established, setting password reset mode');
            setPasswordResetMode(true);
          }
          
          return data.session;
        }
      } catch (err) {
        console.error('Exception creating session from URL:', err);
        throw err;
      }
    };

    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      if (url.includes('reset-password') && url.includes('type=recovery')) {
        console.log('Password reset deep link detected');
        
        try {
          await createSessionFromUrl(url);
        } catch (err) {
          console.error('Failed to create session from URL:', err);
        }
        
        router.push('/screens/ResetPasswordScreen');
      }
    };

    // 处理应用已启动时的deep link
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // 处理应用冷启动时的deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, []);

  // ③ 登录状态变化时的重定向逻辑（保持原逻辑不变）
  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace('/screens/WelcomeScreen');
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // ④ Stack 导航器
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="screens/WelcomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/AuthScreen" options={{ header: () => <View style={{ height: 160 }} /> }} />
      <Stack.Screen name="screens/RegisterScreen" options={{ headerShown: false }} />
      <Stack.Screen name="screens/ForgotPasswordScreen" options={{ header: () => <View style={{ height: 160 }} /> }} />
      <Stack.Screen name="screens/ResetPasswordScreen" options={{ header: () => <View style={{ height: 160 }} /> }} />
      <Stack.Screen name="screens/PlanFormScreen" options={{ title: 'Edit Plan', headerBackTitle: 'Back' }} />
      
      {/* 设置页面 */}
      <Stack.Screen name="screens/EmailSettingScreen" options={{ title: 'Email', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/PasswordSettingScreen" options={{ title: 'Password', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/NotificationSettingScreen" options={{ title: 'Notification', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/SubscriptionScreen" options={{ title: 'My Subscription', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/LanguageSettingScreen" options={{ title: 'Language', headerBackTitle: 'Back' }} />
      <Stack.Screen name="screens/ContentDisplayScreen" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  // ⑤ 在根布局组件中，使用 SafeAreaProvider 和 AuthProvider 包裹所有内容
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AuthProvider>
        {/*<PaperProvider>*/}
        <AppLayout />
        {/*</PaperProvider>*/}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
